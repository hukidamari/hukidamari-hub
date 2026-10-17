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
  const picture = new Sprite();
  picture.anchor.set(0.5);
  const lettering = new Text({ text: "", resolution: 2 });
  lettering.anchor.set(0.5);
  artwork.addChild(picture, lettering);
  const wave = createWaveFilter();
  const effects = { wave, glow: createEffectFilter("glow"), pixel: createEffectFilter("pixel"), rgb: createEffectFilter("rgb") };
  // Keep effect coordinates stable when text or image bounds change.
  artwork.filterArea = new Rectangle(0, 0, STAGE_SIZE, STAGE_SIZE);
  let source: HTMLImageElement | null = null;
  let texture: Texture | null = null;

  return {
    render(draft: EmojiDraft, image: HTMLImageElement | null): RenderResult {
      if (source !== image) {
        if (texture) texture.destroy(true);
        source = image;
        texture = image ? Texture.from(image) : null;
        picture.texture = texture ?? Texture.EMPTY;
      }
      picture.visible = Boolean(image);
      if (image) {
        const fit = (draft.text.trim() ? 300 : 430) / Math.max(image.naturalWidth, image.naturalHeight);
        picture.scale.set(fit * draft.image.scale);
        picture.position.set(draft.image.x, draft.image.y);
      }
      lettering.visible = Boolean(draft.text.trim());
      if (lettering.visible) {
        lettering.text = draft.text;
        lettering.style = {
          fontFamily: FONT_FAMILIES[draft.font], fontSize: image ? 116 : 170,
          fontWeight: draft.font === "sans" || draft.font === "serif" ? "bold" : "normal",
          fill: draft.color, align: "center", padding: 32,
          stroke: draft.outline ? { color: draft.outlineColor, width: draft.outline, join: "round" } : undefined,
          dropShadow: draft.shadow ? { color: "#121218", alpha: 0.65, blur: draft.shadow, distance: draft.shadow, angle: Math.PI / 4 } : undefined,
          wordWrap: false,
        };
        lettering.scale.set(1);
        const fit = Math.min(1, 450 / Math.max(lettering.width, 1), (image ? 190 : 440) / Math.max(lettering.height, 1));
        lettering.scale.set(fit * draft.lettering.scale);
        lettering.position.set(draft.lettering.x, draft.lettering.y);
      }
      wave.resources.waveUniforms.uniforms.uStrength = draft.strength;
      wave.resources.waveUniforms.uniforms.uPhase = draft.phase;
      for (const effect of [effects.glow, effects.pixel, effects.rgb]) {
        effect.resources.effectUniforms.uniforms.uStrength = draft.strength;
      }
      artwork.filters = draft.effect === "none" || draft.strength === 0 ? [] : [effects[draft.effect]];
      const bounds: RenderResult["bounds"] = {};
      for (const [id, item] of [["image", picture], ["text", lettering]] as const) {
        if (item.visible) {
          const b = item.getBounds();
          bounds[id] = { x: b.x, y: b.y, width: b.width, height: b.height };
        }
      }
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
      texture?.destroy(true);
    },
  };
}
