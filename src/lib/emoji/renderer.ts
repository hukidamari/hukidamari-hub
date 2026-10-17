import { Application, Container, Rectangle, Sprite, Text, Texture } from "pixi.js";
import { createEffectFilter } from "./effect-filters";
import { createWaveFilter } from "./wave-filter";
import { FONT_FAMILIES, OUTPUT_SIZE, STAGE_SIZE, type EmojiDraft, type ElementId } from "./model";

export type ElementBounds = { x: number; y: number; width: number; height: number };
export type RenderResult = { url: string; bounds: Partial<Record<ElementId, ElementBounds>> };

export async function createEmojiRenderer(host: HTMLElement) {
  const app = new Application();
  await app.init({
    width: STAGE_SIZE, height: STAGE_SIZE, backgroundAlpha: 0,
    antialias: true, resolution: 1, preference: "webgl", autoStart: false,
  });
  const canvas = app.canvas;
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);
  const artwork = new Container();
  app.stage.addChild(artwork);
  const objects = new Map<ElementId, Sprite | Text>();
  const textures = new Map<HTMLImageElement, Texture>();
  const wave = createWaveFilter();
  const effects = { wave, glow: createEffectFilter("glow"), pixel: createEffectFilter("pixel"), rgb: createEffectFilter("rgb") };
  // Keep effect coordinates stable when text or image bounds change.
  artwork.filterArea = new Rectangle(0, 0, STAGE_SIZE, STAGE_SIZE);

  return {
    render(draft: EmojiDraft): RenderResult {
      const ids = new Set(draft.layers.map(layer => layer.id));
      for (const [id, object] of objects) {
        if (!ids.has(id)) { object.destroy(); objects.delete(id); }
      }
      const sources = new Set(draft.layers.flatMap(layer => layer.kind === "image" ? [layer.source] : []));
      const bounds: RenderResult["bounds"] = {};
      for (const [index, layer] of draft.layers.entries()) {
        let object = objects.get(layer.id);
        if (!object) {
          object = layer.kind === "text" ? new Text({ text: "", resolution: 2 }) : new Sprite();
          object.anchor.set(0.5);
          objects.set(layer.id, object);
          artwork.addChild(object);
        }
        artwork.setChildIndex(object, index);
        object.visible = layer.kind === "image" || Boolean(layer.text.trim());
        if (layer.kind === "image" && object instanceof Sprite) {
          let texture = textures.get(layer.source);
          if (!texture) { texture = Texture.from(layer.source); textures.set(layer.source, texture); }
          object.texture = texture;
          const fit = 430 / Math.max(layer.source.naturalWidth, layer.source.naturalHeight);
          object.scale.set(fit * layer.transform.scale);
        } else if (layer.kind === "text" && object instanceof Text) {
          object.text = layer.text;
          object.style = {
            fontFamily: FONT_FAMILIES[layer.font], fontSize: 170,
            fontWeight: layer.font === "sans" || layer.font === "serif" ? "bold" : "normal",
            fill: layer.color, align: "center", padding: 32,
            stroke: layer.outline ? { color: layer.outlineColor, width: layer.outline, join: "round" } : undefined,
            dropShadow: layer.shadow || layer.shadowBlur ? { color: layer.shadowColor, alpha: 0.65, blur: layer.shadowBlur, distance: layer.shadow, angle: Math.PI / 4 } : undefined,
            wordWrap: false,
          };
          object.scale.set(1);
          const fit = Math.min(1, 450 / Math.max(object.width, 1), 440 / Math.max(object.height, 1));
          object.scale.set(fit * layer.transform.scale);
        }
        object.position.set(layer.transform.x, layer.transform.y);
        if (object.visible) {
          const b = object.getBounds();
          bounds[layer.id] = { x: b.x, y: b.y, width: b.width, height: b.height };
        }
      }
      for (const [source, texture] of textures) {
        if (!sources.has(source)) { texture.destroy(true); textures.delete(source); }
      }
      wave.resources.waveUniforms.uniforms.uStrength = draft.effectSettings.wave.strength;
      wave.resources.waveUniforms.uniforms.uPhase = draft.effectSettings.wave.phase;
      wave.resources.waveUniforms.uniforms.uAngle = draft.effectSettings.wave.angle * Math.PI / 180;
      effects.rgb.resources.effectUniforms.uniforms.uAngle = draft.effectSettings.rgb.angle * Math.PI / 180;
      const glowColor = Number.parseInt(draft.effectSettings.glow.color.slice(1), 16);
      effects.glow.resources.effectUniforms.uniforms.uGlowColor = new Float32Array([
        ((glowColor >> 16) & 255) / 255, ((glowColor >> 8) & 255) / 255, (glowColor & 255) / 255,
      ]);
      for (const id of ["glow", "pixel", "rgb"] as const) {
        effects[id].resources.effectUniforms.uniforms.uStrength = draft.effectSettings[id].strength;
      }
      artwork.filters = draft.effects.filter(id => draft.effectSettings[id].strength > 0).map(id => effects[id]);
      app.render();
      // A fixed frame keeps empty margins and clips artwork to the same square
      // as the editor. The selection controls/background are not in this scene.
      const extracted = app.renderer.extract.canvas({
        target: artwork, frame: new Rectangle(0, 0, STAGE_SIZE, STAGE_SIZE),
        resolution: 1, clearColor: [0, 0, 0, 0],
      }) as HTMLCanvasElement;
      const output = document.createElement("canvas");
      output.width = output.height = OUTPUT_SIZE;
      const ctx = output.getContext("2d");
      if (!ctx) throw new Error("PNGの書き出しを準備できませんでした。");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(extracted, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      return { url: output.toDataURL("image/png"), bounds };
    },
    destroy() {
      canvas.remove();
      artwork.filters = [];
      for (const effect of Object.values(effects)) effect.destroy();
      app.destroy(true, { children: true, texture: false, textureSource: false });
      for (const texture of textures.values()) texture.destroy(true);
      textures.clear();
      objects.clear();
    },
  };
}
