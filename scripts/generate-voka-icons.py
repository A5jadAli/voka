"""Generate VOKA launcher and splash artwork from the brand geometry."""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "images"
INK = "#131211"
ORANGE = "#FF4A17"
CREAM = "#F1EDE3"
SCALE = 4


def scaled(value: int) -> int:
    return value * SCALE


def draw_mark(canvas: Image.Image, monochrome: bool = False) -> None:
    draw = ImageDraw.Draw(canvas)
    ink = INK
    accent = INK if monochrome else ORANGE

    draw.ellipse((scaled(210), scaled(150), scaled(814), scaled(754)), fill=ink)
    draw.polygon(
        [(scaled(625), scaled(700)), (scaled(800), scaled(840)), (scaled(745), scaled(655))],
        fill=ink,
    )

    draw.rounded_rectangle(
        (scaled(435), scaled(285), scaled(589), scaled(535)),
        radius=scaled(72),
        fill=accent,
    )
    draw.line(
        [(scaled(385), scaled(475)), (scaled(385), scaled(510)), (scaled(410), scaled(575)),
         (scaled(465), scaled(610)), (scaled(512), scaled(618)), (scaled(559), scaled(610)),
         (scaled(614), scaled(575)), (scaled(639), scaled(510)), (scaled(639), scaled(475))],
        fill=accent,
        width=scaled(28),
        joint="curve",
    )
    draw.rounded_rectangle(
        (scaled(494), scaled(604), scaled(530), scaled(686)),
        radius=scaled(18),
        fill=accent,
    )
    draw.rounded_rectangle(
        (scaled(430), scaled(670), scaled(594), scaled(704)),
        radius=scaled(17),
        fill=accent,
    )


def render(filename: str, size: int, background: str | None, monochrome: bool = False) -> None:
    mode = "RGB" if background else "RGBA"
    fill = background if background else (0, 0, 0, 0)
    large = Image.new(mode, (scaled(1024), scaled(1024)), fill)
    draw_mark(large, monochrome=monochrome)
    image = large.resize((size, size), Image.Resampling.LANCZOS)
    image.save(OUTPUT / filename, optimize=True)


def render_background() -> None:
    Image.new("RGB", (512, 512), CREAM).save(
        OUTPUT / "android-icon-background.png", optimize=True
    )


if __name__ == "__main__":
    render("icon.png", 1024, CREAM)
    render("android-icon-foreground.png", 512, None)
    render("android-icon-monochrome.png", 432, None, monochrome=True)
    render("splash-icon.png", 512, None)
    render("favicon.png", 128, CREAM)
    render_background()
