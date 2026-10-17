"use client";
import styles from "./emoji-editor.module.css";

export function Slider({ label, value, min, max, step = 1, unit = "", onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (value: number) => void;
}) {
  return <label className={styles.slider}><span>{label}<output>{Math.round(value * 100) / 100}{unit}</output></span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
  </label>;
}

const swatches = ["#ffffff", "#ffe477", "#ff8a9e", "#a7e4df", "#86baff", "#292329"];

export function ColorPalette({ label, value, onChange }: {
  label: string; value: string; onChange: (value: string) => void;
}) {
  return <fieldset className={styles.palette}><legend>{label}</legend>
    {swatches.map(color => <button key={color} type="button" title={color} aria-label={`${label} ${color}`} aria-pressed={value.toLowerCase() === color} style={{ backgroundColor: color }} onClick={() => onChange(color)} />)}
    <label className={styles.customColor} title={`その他の${label}`} style={!swatches.includes(value.toLowerCase()) ? { backgroundColor: value, outline: "2px solid #5ccad3", outlineOffset: 2 } : undefined}><input type="color" aria-label={`その他の${label}`} value={value} onChange={(event) => onChange(event.target.value)} /><span aria-hidden="true">＋</span></label>
  </fieldset>;
}
