from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Image, PageBreak, Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(r"F:\Movie_Vault")
DOCS_DIR = ROOT / "docs"
ASSETS_DIR = ROOT / "assets"
OUTPUT_PDF = DOCS_DIR / "MovieVault_Project_Documentation.pdf"


NAVY = colors.HexColor("#0B1020")
MID = colors.HexColor("#4E596E")
ACCENT = colors.HexColor("#1B90FF")


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="CoverTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=28,
            leading=32,
            textColor=NAVY,
            alignment=TA_CENTER,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CoverSubtitle",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=13,
            leading=17,
            textColor=ACCENT,
            alignment=TA_CENTER,
            spaceAfter=18,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Body",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.8,
            leading=16,
            textColor=MID,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Section",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            textColor=NAVY,
            spaceBefore=10,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Lead",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=11.5,
            leading=18,
            textColor=MID,
            alignment=TA_CENTER,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Label",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.8,
            leading=16,
            textColor=MID,
            spaceAfter=4,
        )
    )
    return styles


def para(text, styles, style="Body"):
    return Paragraph(text, styles[style])


def label_line(label, text, styles):
    return Paragraph(f"<b>{label}:</b> {text}", styles["Label"])


def add_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(MID)
    canvas.drawCentredString(A4[0] / 2, 20, "MovieVault Project Documentation")
    canvas.restoreState()


def build_pdf():
    styles = build_styles()
    story = []

    logo = ASSETS_DIR / "movievault-logo.png"
    if logo.exists():
        story.append(Spacer(1, 0.85 * inch))
        story.append(Image(str(logo), width=2.2 * inch, height=2.2 * inch))
        story[-1].hAlign = "CENTER"
        story.append(Spacer(1, 0.15 * inch))

    story.extend(
        [
            Paragraph("MovieVault", styles["CoverTitle"]),
            Paragraph("Project documentation and engineering handoff", styles["CoverSubtitle"]),
            Paragraph(
                "MovieVault is a production-minded Expo mobile application for discovering movies across multiple industries using TMDb as the primary content source and OMDb for high-value enrichment such as IMDb ratings and box office information.",
                styles["Lead"],
            ),
            Spacer(1, 0.15 * inch),
            label_line("Project type", "React Native mobile app built with Expo SDK 54", styles),
            label_line("Primary platforms", "Android-first Expo Go development flow with EAS-ready build setup", styles),
            label_line("Data providers", "TMDb for discovery, credits, providers, and imagery; OMDb for IMDb rating and box office", styles),
            label_line("App package", "com.movievault.app", styles),
            label_line("Version", "1.0.0", styles),
            label_line("Current workspace", r"F:\Movie_Vault", styles),
            Spacer(1, 0.15 * inch),
            para(
                "<b>Documentation intent:</b> this document captures the current implementation, technical architecture, product decisions, deployment setup, and recommended next steps for MovieVault as it exists in the codebase on April 27, 2026.",
                styles,
                "Body",
            ),
            PageBreak(),
        ]
    )

    sections = [
        (
            "1. Product Overview",
            [
                "MovieVault is designed as a search-first movie information experience that brings discovery, industry browsing, cast navigation, and movie detail enrichment into a single mobile app.",
                "The current product direction emphasizes speed, clean mobile presentation, and real metadata rather than placeholder content.",
                "The home experience is curated around trending rails and industry-specific sections such as Hollywood, Bollywood, Tollywood, Kollywood, and Mollywood.",
                "Movie detail pages enrich a title with ratings, runtime, cast, streaming providers, and production companies.",
                "Actor pages surface profile information and filmography using both cast and crew credits, which is important for directors and writers such as Trivikram Srinivas.",
            ],
        ),
        (
            "2. Core Features",
            [
                "<b>Home:</b> Trending rail, multi-industry rails, themed hero area, and a search entry point that keeps discovery lightweight.",
                "<b>Search:</b> Debounced global search, recent search history, and infinite query pagination for broader result coverage.",
                "<b>Industry pages:</b> Dedicated wood screens with limited initial load and a wider industry search when the user starts typing.",
                "<b>Movie detail:</b> Poster or backdrop hero, runtime, ratings, production, streaming providers, top cast, and box office enrichment.",
                "<b>Actor detail:</b> Personal profile, biography, debut movie, top loaded box office title, and 3-column filmography.",
                "<b>Theme support:</b> Dark and light modes with custom home interactions and screen-level theme treatment.",
            ],
        ),
        (
            "3. Technology Stack",
            [
                "<b>Framework:</b> Expo SDK 54 with React Native 0.81.5 and React 19.1.0.",
                "<b>Navigation:</b> Expo Router using the file-based app directory.",
                "<b>Data and caching:</b> TanStack Query 5 with custom service-layer caching and local persistence patterns.",
                "<b>UI utilities:</b> Expo Image, Expo Linear Gradient, FlashList, AsyncStorage, and icon-driven components.",
                "<b>Build and release:</b> Expo App Services configuration present in eas.json with development, preview, and production profiles.",
            ],
        ),
        (
            "4. Screen Inventory",
            [
                "<b>app/index.tsx:</b> Home screen with themed hero, animated top element, rails, and tap-through search bar.",
                "<b>app/search.tsx:</b> Global search experience with recent history and paginated results.",
                "<b>app/category/[industry].tsx:</b> Industry-specific catalog page with scoped search.",
                "<b>app/movie/[id].tsx:</b> Movie detail page with providers above cast and a production section.",
                "<b>app/actor/[id].tsx:</b> Actor and crew profile page with filmography.",
                "<b>app/watchlist.tsx:</b> Watchlist route shell for future persistent user flows.",
                "<b>Current product note:</b> the watchlist route exists in the navigation shell, but it should still be treated as an expansion path rather than a fully mature synchronized feature.",
            ],
        ),
        (
            "5. Data Model and API Flow",
            [
                "MovieVault uses TMDb as the authoritative source for discovery, credits, provider availability, imagery, and most detail-page metadata.",
                "OMDb is called selectively for enrichment, mainly to surface IMDb rating and box office values where available.",
                "The project normalizes remote responses into stable internal models: MovieSummary, MovieDetail, PersonSummary, and PersonDetail.",
                "For actor pages, cast and crew movie credits are merged and deduplicated before rendering filmography so creators outside acting roles are still represented correctly.",
                "<b>MovieSummary:</b> Lightweight card model used across home, search, and industry rails.",
                "<b>MovieDetail:</b> Expanded title model with runtime, IMDb rating, providers, production companies, and curated people rail.",
                "<b>PersonSummary:</b> Compact cast or crew representation used in movie detail.",
                "<b>PersonDetail:</b> Profile, biography, debut movie, top loaded box office title, and filmography grid.",
            ],
        ),
        (
            "6. Performance and UX Patterns",
            [
                "The app is intentionally structured to feel fast even when upstream APIs are variable.",
                "Debounced search reduces API churn and improves perceived responsiveness.",
                "Parallel detail fetches reduce waterfalls on movie pages.",
                "Home and category pages avoid loading overly large payloads up front.",
                "Caching is used in both TanStack Query and service helpers to preserve speed and reduce repeat network work.",
                "Search history is persisted locally for quick repeat actions.",
                "Skeleton-first and themed UI decisions reduce the feeling of blank-state latency.",
            ],
        ),
        (
            "7. Project Structure",
            [
                "<b>app:</b> Route-level screens including home, search, category, movie, actor, and watchlist.",
                "<b>components:</b> Reusable cards, lists, filters, search elements, and UI primitives.",
                "<b>hooks:</b> Query and interaction hooks such as useHomeFeed, useMovieSearch, useMovieDetail, and search history.",
                "<b>services:</b> TMDb client, OMDb client, normalization, HTTP helpers, and movie orchestration.",
                "<b>types:</b> Shared TypeScript contracts for movies and people.",
                "<b>theme:</b> Color tokens and theme-aware UI surface definitions.",
            ],
        ),
        (
            "8. Build and Deployment",
            [
                "Local development is currently optimized for Expo Go on Android. The application is configured to use automatic theme handling and is already wired with Expo Router and EAS metadata.",
                "<b>Recommended developer flow:</b> 1) cd F:\\Movie_Vault  2) npm.cmd install  3) npm.cmd run start  4) Open the QR session in Expo Go  5) Use EAS profiles defined in eas.json for builds.",
                "<b>Preview build intent:</b> Internal Android testing and shareable install flow.",
                "<b>Production build intent:</b> Release-ready store artifact pipeline.",
                "<b>Current icon and splash:</b> Configured from assets/movievault-logo.png in app.json.",
                "<b>User interface style:</b> automatic.",
            ],
        ),
        (
            "9. Security and Operational Notes",
            [
                "The current app.json stores TMDb and OMDb keys in expo.extra, which is acceptable for local prototyping but not ideal for a production-grade public client.",
                "The architecture notes already point toward the correct next move: place API access behind a Node service with Redis caching.",
                "That backend layer would improve key protection, cache sharing, rate-limit resilience, and normalization consistency.",
                "Streaming provider availability is region-sensitive and depends on TMDb watch provider coverage.",
            ],
        ),
        (
            "10. Recommended Next Steps",
            [
                "Move API traffic behind a backend aggregator with Redis.",
                "Implement a real persisted watchlist and optional authentication.",
                "Persist TanStack Query cache for stronger offline behavior.",
                "Add instrumentation for search latency, cache hit rate, and transition time.",
                "Create a final build pipeline with tested icons, splash assets, and Play Store-ready metadata.",
                "<b>Bottom line:</b> MovieVault already has the skeleton of a serious movie discovery product with normalized data, themed mobile UI, search-first flows, industry-specific browsing, and a codebase arranged for future scale. The biggest remaining step is moving from direct-client API usage to a production backend layer.",
            ],
        ),
    ]

    for heading, items in sections:
        story.append(Paragraph(heading, styles["Section"]))
        for item in items:
            story.append(Paragraph(item, styles["Body"]))

    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=A4,
        rightMargin=0.72 * inch,
        leftMargin=0.72 * inch,
        topMargin=0.62 * inch,
        bottomMargin=0.58 * inch,
    )
    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)


if __name__ == "__main__":
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    build_pdf()
