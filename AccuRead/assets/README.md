# AccuRead App Icons and Assets

This directory contains all the visual assets for the AccuRead mobile application.

## Required Assets

### App Icons
- `icon.png` - Main app icon (1024x1024)
- `favicon.png` - Web favicon (32x32)

### Splash Screen
- `splash-icon.png` - Splash screen icon (200x200)
- `splash-background.png` - Splash background (optional)

### Platform Specific Icons
- `android-icon-foreground.png` - Android adaptive icon foreground
- `android-icon-background.png` - Android adaptive icon background
- `android-icon-monochrome.png` - Android monochrome icon

## Asset Requirements

### App Icon (icon.png)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Design**: Clean, recognizable at small sizes
- **Colors**: Should work well on light and dark backgrounds
- **Content**: Smart meter or camera-related imagery

### Splash Icon (splash-icon.png)
- **Size**: 200x200 pixels
- **Format**: PNG with transparency
- **Design**: Simple, clean version of app icon
- **Background**: Will be placed on colored background

### Android Icons
- **Foreground**: 1024x1024, transparent background
- **Background**: 1024x1024, solid color
- **Monochrome**: 1024x1024, single color

## Design Guidelines

1. **Simplicity**: Icons should be simple and recognizable
2. **Contrast**: High contrast for visibility
3. **Scalability**: Look good at all sizes
4. **Brand Consistency**: Match AccuRead brand colors
5. **Professional**: Clean, enterprise-grade appearance

## Color Palette Reference

- **Primary**: #1E3A8A (Deep Blue)
- **Secondary**: #F97316 (Safety Orange)
- **Success**: #10B981 (Green)
- **Background**: #111827 (Dark Gray)

## Implementation Notes

The app.json file is already configured to use these assets. Once the actual image files are added, the app will display them properly across all platforms.

For production deployment, ensure all assets are optimized for size and quality.
