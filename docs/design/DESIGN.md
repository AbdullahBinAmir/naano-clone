# Design System

## Direction
Dark, bold, friendly. Black canvas, soft rounded cards, one purple accent,
yellow as a secondary highlight. Big confident headings, generous spacing.
Not glassmorphism. No blur, no translucent cards.

## Colors
- Background: #000000
- Card: #141416 / Card raised: #1C1C1F
- Border: rgba(255,255,255,0.06)
- Text: #FFFFFF / Muted: #8A8A93
- Accent (purple): #9B5CF6
- Accent soft (selected pills): #E9D5FF with #1A1A1A text
- Highlight (yellow): #F5C542
- Success: #22C55E / Danger: #F43F5E
- Feature gradient: purple #A855F7 → yellow #F5C542 (use ONCE per page)

## Shape
- Card radius: 24px; pills and buttons: 16px; avatars: full circle
- Card padding: 24–28px; grid gap: 16px

## Typography
- Font: "Outfit" (or "Sora"), via next/font
- Page titles: 32px, semibold; card titles: 18px, medium; labels: 13px muted

## Components
- Pill date strip: row of rounded tiles (day number + weekday), selected = accent soft
- Stat chips in header: dark pill with avatar stack + "12 of 15 on work"-style text
- Sidebar: narrow floating icon rail, rounded, with notification badge
- Chart: smooth area line in purple with gradient fill + dashed yellow comparison line
- Dot grid: small purple/yellow dots showing progress or activity