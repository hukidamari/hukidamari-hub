"use client";

import { Fragment, useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowUp, ArrowDown, Download, Layers, RotateCcw, Sparkles } from "lucide-react";
import { clamp, initialDraft, createTextLayer, layerName, MAX_IMAGE_BYTES, STAGE_SIZE, EFFECTS, type EffectId, type ElementId, type EmojiDraft, type Transform, type TextAppearance } from "@/lib/emoji/model";
import type { createEmojiRenderer, RenderResult, ElementBounds } from "@/lib/emoji/renderer";
import { loadFont } from "@/lib/emoji/fonts";
import LayerPanel, { MAX_LAYERS } from "./layer-panel";
import { Slider, ColorPalette } from "./editor-controls";
import { snapAxis } from "@/lib/emoji/snapping";
import styles from "./emoji-editor.module.css";

type Renderer = Awaited<ReturnType<typeof createEmojiRenderer>>;
export default function EmojiEditor() {
  const [draft, setDraft] = useState(initialDraft);
  const [selected, setSelected] = useState<ElementId | null>("initial-text");
  const [panel, setPanel] = useState<"layers" | "effects">("layers");
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<(RenderResult & { draft: EmojiDraft }) | null>(null);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);
  const [guides, setGuides] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [background, setBackground] = useState("checker");
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const renderer = useRef<Renderer | null>(null);
  const uploadVersion = useRef(0);
  const uploadTarget = useRef<string | undefined>(undefined);
  const mounted = useRef(true);
  const drag = useRef<{ id: ElementId; pointer: number; x: number; y: number; start: Transform; bounds?: ElementBounds; resize?: { width: number; height: number; sx: number; sy: number } } | null>(null);

  useEffect(() => {
    let cancelled = false;
    mounted.current = true;
    async function init() {
      try {
        await loadFont("dela");
        const { createEmojiRenderer } = await import("@/lib/emoji/renderer");
        if (cancelled || !host.current) return;
        const instance = await createEmojiRenderer(host.current);
        if (cancelled) { instance.destroy(); return; }
        renderer.current = instance;
        setReady(true);
      } catch {
        if (!cancelled) setError("描画を開始できませんでした。WebGLを利用できるブラウザで再読み込みしてください。");
      }
    }
    void init();
    return () => {
      cancelled = true;
      mounted.current = false;
      renderer.current?.destroy();
      renderer.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    let frame = 0;
    void Promise.all([...new Set(draft.layers.flatMap(layer => layer.kind === "text" ? [layer.font] : []))].map(loadFont)).then(() => {
      if (cancelled) return;
      frame = requestAnimationFrame(() => {
        try {
          const next = renderer.current?.render(draft);
          if (next) { setResult({ ...next, draft }); setError(""); }
        } catch {
          setError("プレビューを描画できませんでした。画像やエフェクトの設定を変更してみてください。");
        }
      });
    }).catch(() => { if (!cancelled) setError("フォントを読み込めませんでした。もう一度選んでください。"); });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [draft, ready]);

  function update<K extends keyof EmojiDraft>(key: K, value: EmojiDraft[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }
  function toggleEffect(id: EffectId) {
    setDraft(previous => ({ ...previous, effects: previous.effects.includes(id) ? previous.effects.filter(effect => effect !== id) : [...previous.effects, id] }));
  }
  function configureEffect<K extends EffectId>(id: K, change: Partial<EmojiDraft["effectSettings"][K]>) {
    setDraft(previous => ({ ...previous, effectSettings: { ...previous.effectSettings, [id]: { ...previous.effectSettings[id], ...change } } }));
  }
  function moveEffect(id: EffectId, delta: number) {
    setDraft(previous => {
      const effects = [...previous.effects];
      const index = effects.indexOf(id);
      const target = index + delta;
      if (index < 0 || target < 0 || target >= effects.length) return previous;
      [effects[index], effects[target]] = [effects[target], effects[index]];
      return { ...previous, effects };
    });
  }
  const selectedLayer = draft.layers.find(layer => layer.id === selected);
  function updateText(change: Partial<TextAppearance & { text: string }>) {
    setDraft(previous => ({ ...previous, layers: previous.layers.map(layer => layer.id === selected && layer.kind === "text" ? { ...layer, ...change } : layer) }));
  }
  function transform(id: ElementId, change: Partial<Transform>) {
    setDraft(previous => ({ ...previous, layers: previous.layers.map(layer => layer.id === id ? { ...layer, transform: { ...layer.transform, ...change } } : layer) }));
  }
  function selectLayer(id: string) { setSelected(id); setPanel("layers"); }
  function addText() {
    if (loadingImage || draft.layers.length >= MAX_LAYERS) return;
    const layer = createTextLayer(crypto.randomUUID());
    setDraft(previous => ({ ...previous, layers: [...previous.layers, layer] }));
    selectLayer(layer.id);
  }
  function moveLayer(id: string, delta: number) {
    setDraft(previous => {
      const layers = [...previous.layers];
      const index = layers.findIndex(layer => layer.id === id);
      const target = index + delta;
      if (index < 0 || target < 0 || target >= layers.length) return previous;
      [layers[index], layers[target]] = [layers[target], layers[index]];
      return { ...previous, layers };
    });
  }
  function duplicateLayer(id: string) {
    const original = draft.layers.find(layer => layer.id === id);
    if (!original || loadingImage || draft.layers.length >= MAX_LAYERS) return;
    const copy = { ...original, id: crypto.randomUUID(), transform: { ...original.transform, x: clamp(original.transform.x + 16, 0, STAGE_SIZE), y: clamp(original.transform.y + 16, 0, STAGE_SIZE) } };
    setDraft(previous => {
      const layers = [...previous.layers];
      layers.splice(layers.findIndex(layer => layer.id === id) + 1, 0, copy);
      return { ...previous, layers };
    });
    selectLayer(copy.id);
  }
  function removeLayer(id: string) {
    if (uploadTarget.current === id) {
      ++uploadVersion.current;
      uploadTarget.current = undefined;
      setLoadingImage(false);
    }
    const index = draft.layers.findIndex(layer => layer.id === id);
    const remaining = draft.layers.filter(layer => layer.id !== id);
    setDraft(previous => ({ ...previous, layers: previous.layers.filter(layer => layer.id !== id) }));
    if (selected === id) setSelected(remaining[Math.min(index, remaining.length - 1)]?.id ?? null);
    finishDrag();
  }
  function autoLayout() {
    const count = draft.layers.length;
    const columns = count <= 2 ? 1 : Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / columns);
    const width = STAGE_SIZE / columns, height = STAGE_SIZE / Math.max(rows, 1);
    setDraft(previous => ({ ...previous, layers: previous.layers.map((layer, index) => {
      const bounds = result?.bounds[layer.id];
      const scale = bounds ? Math.min(1, (width - 32) / (bounds.width / layer.transform.scale), (height - 32) / (bounds.height / layer.transform.scale)) : 1;
      return { ...layer, transform: { x: (index % columns + 0.5) * width, y: (Math.floor(index / columns) + 0.5) * height, scale: clamp(scale, 0.2, 2) } };
    }) }));
  }
  async function loadImage(file?: File, replaceId?: string) {
    if (!file || (!replaceId && draft.layers.length >= MAX_LAYERS)) return;
    const version = ++uploadVersion.current;
    uploadTarget.current = replaceId;
    setImageError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setLoadingImage(false);
      setImageError("PNG・JPEG・WebPの画像を選んでください。"); return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setLoadingImage(false);
      setImageError("画像は5 MB以下にしてください。"); return;
    }
    setLoadingImage(true);
    const url = URL.createObjectURL(file);
    try {
      const element = new Image();
      element.src = url;
      await element.decode();
      if (element.naturalWidth * element.naturalHeight > 16_000_000) throw new Error("large");
      if (!mounted.current || version !== uploadVersion.current) return;
      const id = replaceId ?? crypto.randomUUID();
      setDraft(previous => ({ ...previous, layers: replaceId ? previous.layers.map(layer => layer.id === id && layer.kind === "image" ? { ...layer, source: element, name: file.name } : layer) : previous.layers.length < MAX_LAYERS ? [...previous.layers, { id, kind: "image", source: element, name: file.name, transform: { x: 256, y: 256, scale: 1 } }] : previous.layers }));
      if (!replaceId || draft.layers.some(layer => layer.id === replaceId)) selectLayer(id);
    } catch {
      if (mounted.current && version === uploadVersion.current) setImageError("画像を読み込めませんでした。縦×横が1600万画素以下の別の画像をお試しください。");
    } finally {
      URL.revokeObjectURL(url);
      if (mounted.current && version === uploadVersion.current) { setLoadingImage(false); uploadTarget.current = undefined; }
    }
  }
  function beginDrag(event: PointerEvent<HTMLButtonElement>, id: ElementId) {
    if (event.button !== 0) return;
    selectLayer(id);
    const layer = draft.layers.find(layer => layer.id === id);
    if (!layer) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id, pointer: event.pointerId, x: event.clientX, y: event.clientY, start: { ...layer.transform }, bounds: result?.bounds[id] };
  }
  function beginResize(event: PointerEvent<HTMLButtonElement>, id: ElementId, sx: number, sy: number) {
    if (event.button !== 0) return;
    event.preventDefault();
    beginDrag(event, id);
    const bounds = result?.bounds[id];
    if (drag.current && bounds) drag.current.resize = { width: bounds.width, height: bounds.height, sx, sy };
  }
  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId || !stage.current) return;
    const ratio = STAGE_SIZE / stage.current.getBoundingClientRect().width;
    if (current.resize) {
      const { width, height, sx, sy } = current.resize;
      const dx = (event.clientX - current.x) * ratio;
      const dy = (event.clientY - current.y) * ratio;
      // Project onto the diagonal to preserve aspect ratio and the opposite corner.
      const factor = 1 + (sx * dx * width + sy * dy * height) / Math.max(width * width + height * height, 1);
      const scale = clamp(current.start.scale * factor, 0.2, 2);
      const change = scale / current.start.scale - 1;
      transform(current.id, {
        scale,
        x: clamp(current.start.x + sx * width * change / 2, 0, STAGE_SIZE),
        y: clamp(current.start.y + sy * height * change / 2, 0, STAGE_SIZE),
      });
      return;
    }
    const x = clamp(current.start.x + (event.clientX - current.x) * ratio, 0, STAGE_SIZE);
    const y = clamp(current.start.y + (event.clientY - current.y) * ratio, 0, STAGE_SIZE);
    if (event.shiftKey || !current.bounds) {
      setGuides({ x: null, y: null });
      transform(current.id, { x, y });
      return;
    }
    const snapX = snapAxis(x, current.start.x, current.bounds.x, current.bounds.width, 6 * ratio);
    const snapY = snapAxis(y, current.start.y, current.bounds.y, current.bounds.height, 6 * ratio);
    setGuides({ x: snapX.guide, y: snapY.guide });
    transform(current.id, { x: snapX.position, y: snapY.position });
  }
  function finishDrag() {
    drag.current = null;
    setGuides({ x: null, y: null });
  }

  const hasContent = draft.layers.some(layer => layer.kind === "image" || layer.text.trim());
  const currentTransform = selectedLayer?.transform;
  const currentResult = result?.draft === draft && !error;
  const canExport = ready && hasContent && currentResult && !loadingImage;

  return <main className={styles.workshop}>
    <div className={styles.heading}>
      <h1>絵文字工房</h1>
      <button className={styles.download} type="button" disabled={!canExport} onClick={() => {
        if (!result || !canExport) return;
        const link = document.createElement("a");
        link.href = result.url; link.download = "hukidamari-emoji.png"; link.click();
      }}><Download size={16} /> PNGを保存</button>
    </div>
    <div className={styles.workspace}>
      <section className={styles.previewPanel} aria-label="絵文字のプレビュー">
        <div className={styles.previewTools}>
          <button type="button" className={styles.quietButton} onClick={autoLayout} title="画像と文字の位置・大きさを自動で整える"><RotateCcw size={14} /> 自動配置</button>
          <div className={styles.backgrounds} aria-label="確認用の背景色">
            {[["checker", "透明"], ["light", "明るい背景"], ["dark", "暗い背景"]].map(([value, label]) =>
              <button key={value} type="button" className={styles[value]} title={label} aria-label={label} onClick={() => setBackground(value)} aria-pressed={background === value} />)}
          </div>
        </div>
        <div className={styles.stageWrap}>
          <div ref={stage} className={`${styles.stage} ${styles[background]}`}>
            <div ref={host} className={styles.canvasHost} />
            {ready && !hasContent && <p className={styles.empty}>文字か画像を追加</p>}
            {!ready && !error && <p className={styles.empty}>読み込み中…</p>}
            {result && draft.layers.map((layer, index) => {
              const id = layer.id;
              const objectLabel = `レイヤー${index + 1}（${layerName(layer)}）`;
              const b = result.bounds[id];
              if (!b) return null;
              return <Fragment key={id}><button type="button" data-canvas-layer={id} aria-label={`${objectLabel}を移動`} aria-pressed={selected === id && panel === "layers"}
                title="ドラッグで移動・端や中央にスナップ／Shiftで解除・矢印キーで微調整"
                className={`${styles.selection} ${selected === id && panel === "layers" ? styles.selected : ""}`}
                style={{ left: `${b.x / STAGE_SIZE * 100}%`, top: `${b.y / STAGE_SIZE * 100}%`, width: `${b.width / STAGE_SIZE * 100}%`, height: `${b.height / STAGE_SIZE * 100}%` }}
                onPointerDown={(event) => beginDrag(event, id)} onPointerMove={moveDrag}
                onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}
                onFocus={() => selectLayer(id)} onKeyDown={(event) => {
                  const delta = event.shiftKey ? 10 : 2;
                  const offset: Record<string, [number, number]> = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowUp: [0, -delta], ArrowDown: [0, delta] };
                  if (!offset[event.key]) return;
                  event.preventDefault();
                  const position = layer.transform;
                  transform(id, { x: clamp(position.x + offset[event.key][0], 0, STAGE_SIZE), y: clamp(position.y + offset[event.key][1], 0, STAGE_SIZE) });
                }} />
                {selected === id && panel === "layers" && ([[-1, -1, "左上"], [1, -1, "右上"], [-1, 1, "左下"], [1, 1, "右下"]] as const).map(([sx, sy, corner]) =>
                  <button key={corner} type="button" className={styles.resizeHandle}
                    aria-label={`${objectLabel}の大きさを変更（${corner}）`}
                    title="ドラッグで拡大・縮小／矢印キーで微調整"
                    style={{ left: `${(b.x + (sx === 1 ? b.width : 0)) / STAGE_SIZE * 100}%`, top: `${(b.y + (sy === 1 ? b.height : 0)) / STAGE_SIZE * 100}%`, cursor: sx === sy ? "nwse-resize" : "nesw-resize" }}
                    onPointerDown={event => beginResize(event, id, sx, sy)} onPointerMove={moveDrag}
                    onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}
                    onKeyDown={event => {
                      const direction = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[event.key];
                      if (!direction) return;
                      event.preventDefault();
                      const value = layer.transform;
                      transform(id, { scale: clamp(value.scale + direction * (event.shiftKey ? 0.1 : 0.01), 0.2, 2) });
                    }} />)}
              </Fragment>;
            })}
            {guides.x !== null && <span aria-hidden="true" data-snap-guide="x" className={styles.guideX} style={{ left: `${guides.x / STAGE_SIZE * 100}%` }} />}
            {guides.y !== null && <span aria-hidden="true" data-snap-guide="y" className={styles.guideY} style={{ top: `${guides.y / STAGE_SIZE * 100}%` }} />}
          </div>
        </div>
        <div className={styles.previewFooter}>
          <div className={`${styles.actualSize} ${styles[background]}`} aria-label="小さい表示で確認">
            <span className={styles.smallEmoji} role="img" aria-label="32pxの絵文字" style={{ backgroundImage: result ? `url("${result.url}")` : undefined }} />
            <span className={styles.tinyEmoji} role="img" aria-label="16pxの絵文字" style={{ backgroundImage: result ? `url("${result.url}")` : undefined }} />
          </div>
          <span className={styles.muted}>128 × 128 · 透明PNG</span>
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
      </section>
      <section className={styles.inspector} aria-label="絵文字の編集">
        <nav className={styles.tools} aria-label="編集する対象">
          <button type="button" aria-pressed={panel === "layers"} onClick={() => setPanel("layers")}><Layers size={17} />レイヤー</button>
          <button type="button" aria-pressed={panel === "effects"} onClick={() => setPanel("effects")}><Sparkles size={17} />効果</button>
        </nav>
        <div className={styles.settings}>
          {panel === "layers" && <>
            <LayerPanel layers={draft.layers} selected={selectedLayer} loading={loadingImage} imageError={imageError}
              onSelect={selectLayer} onAddText={addText} onLoadImage={(file, id) => { void loadImage(file, id); }}
              onMove={moveLayer} onDuplicate={duplicateLayer} onRemove={removeLayer} onTextChange={updateText} />
            {selectedLayer && currentTransform && <div className={styles.transform}>
              <Slider label="大きさ" value={Math.round(currentTransform.scale * 100)} min={20} max={200} unit="%" onChange={value => transform(selectedLayer.id, { scale: value / 100 })} />
              <details className={styles.details}>
                <summary>位置を数値で調整</summary>
                <div className={styles.positionFields}>
                  <label>横<input type="number" min={0} max={128} value={Math.round(currentTransform.x / 4)} onChange={event => transform(selectedLayer.id, { x: clamp(Number(event.target.value) * 4, 0, STAGE_SIZE) })} /></label>
                  <label>縦<input type="number" min={0} max={128} value={Math.round(currentTransform.y / 4)} onChange={event => transform(selectedLayer.id, { y: clamp(Number(event.target.value) * 4, 0, STAGE_SIZE) })} /></label>
                </div>
              </details>
            </div>}
          </>}
          {panel === "effects" && <>
            <fieldset className={styles.effects}><legend>全体の効果</legend>
              {(Object.keys(EFFECTS) as EffectId[]).map(effect =>
                <button key={effect} type="button" aria-pressed={draft.effects.includes(effect)} onClick={() => toggleEffect(effect)}>{EFFECTS[effect].name}</button>)}
            </fieldset>
            {draft.effects.length > 0 && <div className={styles.effectTools}>
              <span>{draft.effects.length > 1 ? "上から順に適用" : "適用中の効果"}</span>
              <button type="button" onClick={() => update("effects", [])}>すべてオフ</button>
            </div>}
            {draft.effects.map((effect, index) => <section key={effect} className={styles.effectSettings} aria-label={`${EFFECTS[effect].name}の設定`}>
              <header><h2>{EFFECTS[effect].name}</h2>
                <div className={styles.effectOrder}>
                  <button type="button" aria-label={`${EFFECTS[effect].name}を上へ`} disabled={index === 0} onClick={() => moveEffect(effect, -1)}><ArrowUp size={14} /></button>
                  <button type="button" aria-label={`${EFFECTS[effect].name}を下へ`} disabled={index === draft.effects.length - 1} onClick={() => moveEffect(effect, 1)}><ArrowDown size={14} /></button>
                </div>
              </header>
              <Slider label={EFFECTS[effect].control} value={draft.effectSettings[effect].strength} min={0} max={24} onChange={strength => configureEffect(effect, { strength })} />
              {(effect === "wave" || effect === "rgb") && <Slider label="向き" unit="°" value={draft.effectSettings[effect].angle} min={0} max={360} onChange={angle => configureEffect(effect, { angle })} />}
              {effect === "glow" && <div className={styles.effectColor}><ColorPalette label="光の色" value={draft.effectSettings.glow.color} onChange={color => configureEffect("glow", { color })} /></div>}
              {effect === "wave" && <Slider label="波の位置" value={draft.effectSettings.wave.phase} min={0} max={6.28} step={0.05} onChange={phase => configureEffect("wave", { phase })} />}
            </section>)}
          </>}
        </div>
      </section>
    </div>
  </main>;
}
