"use client";

import { Fragment, useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowUp, ArrowDown, Download, ImagePlus, RotateCcw, Sparkles, Type, X } from "lucide-react";
import { clamp, initialDraft, layout, MAX_IMAGE_BYTES, STAGE_SIZE, EFFECTS, type EffectId, type ElementId, type EmojiDraft, type Transform } from "@/lib/emoji/model";
import type { createEmojiRenderer, RenderResult } from "@/lib/emoji/renderer";
import { loadFont } from "@/lib/emoji/fonts";
import FontPicker from "./font-picker";
import styles from "./emoji-editor.module.css";

type Renderer = Awaited<ReturnType<typeof createEmojiRenderer>>;
type LoadedImage = { element: HTMLImageElement; name: string };

function Slider({ label, value, min, max, step = 1, unit = "", onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (value: number) => void;
}) {
  return <label className={styles.slider}><span>{label}<output>{Math.round(value * 100) / 100}{unit}</output></span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
  </label>;
}

const swatches = ["#ffffff", "#ffe477", "#ff8a9e", "#a7e4df", "#86baff", "#292329"];

function ColorPalette({ label, value, onChange }: {
  label: string; value: string; onChange: (value: string) => void;
}) {
  return <fieldset className={styles.palette}><legend>{label}</legend>
    {swatches.map(color => <button key={color} type="button" title={color} aria-label={`${label} ${color}`} aria-pressed={value.toLowerCase() === color} style={{ backgroundColor: color }} onClick={() => onChange(color)} />)}
    <label className={styles.customColor} title={`その他の${label}`} style={!swatches.includes(value.toLowerCase()) ? { backgroundColor: value, outline: "2px solid #5ccad3", outlineOffset: 2 } : undefined}><input type="color" aria-label={`その他の${label}`} value={value} onChange={(event) => onChange(event.target.value)} /><span aria-hidden="true">＋</span></label>
  </fieldset>;
}

export default function EmojiEditor() {
  const [draft, setDraft] = useState(initialDraft);
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [selected, setSelected] = useState<ElementId>("text");
  const [panel, setPanel] = useState<"object" | "effects">("object");
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<(RenderResult & { draft: EmojiDraft; image: LoadedImage | null }) | null>(null);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);
  const [background, setBackground] = useState("checker");
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const renderer = useRef<Renderer | null>(null);
  const uploadVersion = useRef(0);
  const mounted = useRef(true);
  const drag = useRef<{ id: ElementId; pointer: number; x: number; y: number; start: Transform; resize?: { width: number; height: number; sx: number; sy: number } } | null>(null);

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
    void loadFont(draft.font).then(() => {
      if (cancelled) return;
      frame = requestAnimationFrame(() => {
        try {
          const next = renderer.current?.render(draft, image?.element ?? null);
          if (next) { setResult({ ...next, draft, image }); setError(""); }
        } catch {
          setError("プレビューを描画できませんでした。画像やエフェクトの設定を変更してみてください。");
        }
      });
    }).catch(() => { if (!cancelled) setError("フォントを読み込めませんでした。もう一度選んでください。"); });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [draft, image, ready]);

  function update<K extends keyof EmojiDraft>(key: K, value: EmojiDraft[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }
  function toggleEffect(id: EffectId) {
    setDraft(previous => ({ ...previous, effects: previous.effects.includes(id) ? previous.effects.filter(effect => effect !== id) : [...previous.effects, id] }));
  }
  function configureEffect(id: EffectId, change: Partial<EmojiDraft["effectSettings"][EffectId]>) {
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
  function transform(id: ElementId, change: Partial<Transform>) {
    const key = id === "image" ? "image" : "lettering";
    setDraft((previous) => ({ ...previous, [key]: { ...previous[key], ...change } }));
  }
  function autoLayout() {
    setDraft((previous) => ({ ...previous, ...layout(Boolean(image), Boolean(previous.text.trim())) }));
  }
  async function loadImage(file?: File) {
    if (!file) return;
    const version = ++uploadVersion.current;
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
      setImage({ element, name: file.name });
      setDraft((previous) => ({ ...previous, ...layout(true, Boolean(previous.text.trim())) }));
      setSelected("image");
      setPanel("object");
    } catch {
      if (mounted.current && version === uploadVersion.current) setImageError("画像を読み込めませんでした。縦×横が1600万画素以下の別の画像をお試しください。");
    } finally {
      URL.revokeObjectURL(url);
      if (mounted.current && version === uploadVersion.current) setLoadingImage(false);
    }
  }
  function removeImage() {
    ++uploadVersion.current;
    setLoadingImage(false);
    setImage(null);
    setSelected("text");
    setPanel("object");
    setDraft((previous) => ({ ...previous, ...layout(false, Boolean(previous.text.trim())) }));
  }
  function beginDrag(event: PointerEvent<HTMLButtonElement>, id: ElementId) {
    if (event.button !== 0) return;
    setSelected(id);
    setPanel("object");
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id, pointer: event.pointerId, x: event.clientX, y: event.clientY, start: { ...(id === "image" ? draft.image : draft.lettering) } };
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
    transform(current.id, {
      x: clamp(current.start.x + (event.clientX - current.x) * ratio, 0, STAGE_SIZE),
      y: clamp(current.start.y + (event.clientY - current.y) * ratio, 0, STAGE_SIZE),
    });
  }
  const hasContent = Boolean(image || draft.text.trim());
  const currentTransform = selected === "image" ? draft.image : draft.lettering;
  const currentResult = result?.draft === draft && result?.image === image && !error;
  const canExport = ready && hasContent && currentResult && !loadingImage;

  const activeTool = panel === "effects" ? "effects" : selected;
  function selectTool(tool: ElementId | "effects") {
    if (tool === "effects") setPanel("effects");
    else { setSelected(tool); setPanel("object"); }
  }

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
            {result && (["image", "text"] as const).map((id) => {
              const b = result.bounds[id];
              if (!b || (id === "image" && !image) || (id === "text" && !draft.text.trim())) return null;
              return <Fragment key={id}><button type="button" aria-label={`${id === "image" ? "画像" : "文字"}を移動`} aria-pressed={selected === id && panel === "object"}
                title="ドラッグで移動・矢印キーで微調整"
                className={`${styles.selection} ${selected === id && panel === "object" ? styles.selected : ""}`}
                style={{ left: `${b.x / STAGE_SIZE * 100}%`, top: `${b.y / STAGE_SIZE * 100}%`, width: `${b.width / STAGE_SIZE * 100}%`, height: `${b.height / STAGE_SIZE * 100}%` }}
                onPointerDown={(event) => beginDrag(event, id)} onPointerMove={moveDrag}
                onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
                onFocus={() => selectTool(id)} onKeyDown={(event) => {
                  const delta = event.shiftKey ? 10 : 2;
                  const offset: Record<string, [number, number]> = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowUp: [0, -delta], ArrowDown: [0, delta] };
                  if (!offset[event.key]) return;
                  event.preventDefault();
                  const position = id === "image" ? draft.image : draft.lettering;
                  transform(id, { x: clamp(position.x + offset[event.key][0], 0, STAGE_SIZE), y: clamp(position.y + offset[event.key][1], 0, STAGE_SIZE) });
                }} />
                {selected === id && panel === "object" && ([[-1, -1, "左上"], [1, -1, "右上"], [-1, 1, "左下"], [1, 1, "右下"]] as const).map(([sx, sy, corner]) =>
                  <button key={corner} type="button" className={styles.resizeHandle}
                    aria-label={`${id === "image" ? "画像" : "文字"}の大きさを変更（${corner}）`}
                    title="ドラッグで拡大・縮小／矢印キーで微調整"
                    style={{ left: `${(b.x + (sx === 1 ? b.width : 0)) / STAGE_SIZE * 100}%`, top: `${(b.y + (sy === 1 ? b.height : 0)) / STAGE_SIZE * 100}%`, cursor: sx === sy ? "nwse-resize" : "nesw-resize" }}
                    onPointerDown={event => beginResize(event, id, sx, sy)} onPointerMove={moveDrag}
                    onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}
                    onKeyDown={event => {
                      const direction = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[event.key];
                      if (!direction) return;
                      event.preventDefault();
                      const value = id === "image" ? draft.image : draft.lettering;
                      transform(id, { scale: clamp(value.scale + direction * (event.shiftKey ? 0.1 : 0.01), 0.2, 2) });
                    }} />)}
              </Fragment>;
            })}
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
          <button type="button" aria-pressed={activeTool === "text"} onClick={() => selectTool("text")}><Type size={17} />文字</button>
          <button type="button" aria-pressed={activeTool === "image"} onClick={() => selectTool("image")}><ImagePlus size={17} />画像</button>
          <button type="button" aria-pressed={activeTool === "effects"} onClick={() => selectTool("effects")}><Sparkles size={17} />効果</button>
        </nav>
        <div className={styles.settings}>
          {activeTool === "text" && <>
            <label className={styles.field}><span>文字 <small>{draft.text.length}/40</small></span>
              <textarea rows={2} maxLength={40} value={draft.text} placeholder="文字を入力" onChange={(event) => {
                const text = event.target.value;
                setDraft((previous) => ({ ...previous, text, ...(Boolean(previous.text.trim()) !== Boolean(text.trim()) ? layout(Boolean(image), Boolean(text.trim())) : {}) }));
              }} />
            </label>
            <FontPicker value={draft.font} text={draft.text} onChange={(font) => update("font", font)} />
            <ColorPalette label="文字色" value={draft.color} onChange={(color) => update("color", color)} />
            <div className={styles.appearance}>
              <ColorPalette label="縁の色" value={draft.outlineColor} onChange={(color) => update("outlineColor", color)} />
              <Slider label="縁の太さ" value={draft.outline} min={0} max={24} onChange={(value) => update("outline", value)} />
              <Slider label="影" value={draft.shadow} min={0} max={24} onChange={(value) => update("shadow", value)} />
            </div>
          </>}
          {activeTool === "image" && <>
            <label className={styles.upload}>
              <ImagePlus size={24} /><span>{loadingImage ? "読み込み中…" : image ? "画像を変更" : "画像を選ぶ"}</span><small>PNG・JPEG・WebP / 5 MBまで</small>
              <input type="file" accept="image/png,image/jpeg,image/webp" aria-label="画像を読み込む" onChange={(event) => { void loadImage(event.target.files?.[0]); event.target.value = ""; }} />
            </label>
            {image && <div className={styles.file}><span>{image.name}</span><button type="button" aria-label="画像を取り除く" title="画像を取り除く" onClick={removeImage}><X size={16} /></button></div>}
            {imageError && <p className={styles.error} role="alert">{imageError}</p>}
          </>}
          {activeTool !== "effects" && (activeTool === "text" || image) && <div className={styles.transform}>
            <Slider label="大きさ" value={Math.round(currentTransform.scale * 100)} min={20} max={200} unit="%" onChange={(value) => transform(selected, { scale: value / 100 })} />
            <details className={styles.details}>
              <summary>位置を数値で調整</summary>
              <div className={styles.positionFields}>
                <label>横<input type="number" min={0} max={128} value={Math.round(currentTransform.x / 4)} onChange={(event) => transform(selected, { x: clamp(Number(event.target.value) * 4, 0, STAGE_SIZE) })} /></label>
                <label>縦<input type="number" min={0} max={128} value={Math.round(currentTransform.y / 4)} onChange={(event) => transform(selected, { y: clamp(Number(event.target.value) * 4, 0, STAGE_SIZE) })} /></label>
              </div>
            </details>
          </div>}
          {activeTool === "effects" && <>
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
              {effect === "wave" && <Slider label="波の位置" value={draft.effectSettings.wave.phase} min={0} max={6.28} step={0.05} onChange={phase => configureEffect("wave", { phase })} />}
            </section>)}
          </>}
        </div>
      </section>
    </div>
  </main>;
}
