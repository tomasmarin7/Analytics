# Background Effects Reusables

## Green grainy surface

Class: `fx-grainy-green-surface`

Location: `src/styles/effects/grainyGreenSurface.css`

Minimal usage:

```css
.my-button-surface {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
}
```

```html
<span class="my-button-surface fx-grainy-green-surface"></span>
```

Custom palette per component:

```css
.my-button-surface.fx-grainy-green-surface {
  --fx-green-c1: #5f7852;
  --fx-green-c2: #adb9a7;
  --fx-green-c3: #355339;
  --fx-green-c4: #92a18f;
  --fx-green-saturation: 1.02;
  --fx-green-contrast: 1.03;
  --fx-green-noise-opacity: 0.12;
}
```
