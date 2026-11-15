# Uroš Maravić — Portfolio

A static portfolio. No package install or build step. Site files live in `dist/`.

## Preview locally

Run `python3 -m http.server 8000 --directory dist` from this directory, then visit http://localhost:8000. Opening the HTML file directly will not load the JSON content.

## Publish on your GitHub Pages

Upload this folder's contents to a GitHub repository, including `.github` and `.pages.yml`. The `.openai` directory belongs to the private preview and can be omitted for GitHub. In repository Settings → Pages, choose **GitHub Actions** as the source. Push to `main` or run the included workflow. All site links are relative, so both a username domain and a repository subpath work.

## Edit visually with Pages CMS

1. Open https://app.pagescms.org and sign in with GitHub.
2. Install its GitHub App for this repository only.
3. Open the repository, then choose **Video Editing**, **VFX & Motion**, **Music Production**, or **AI Video**.
4. Add, remove or reorder Projects; paste video URLs and optionally upload custom thumbnails. Leave the custom thumbnail empty for automatic YouTube covers.
5. Save. GitHub Actions publishes the update.

CMS configuration is included but cannot be connected or tested against your account until a GitHub repository is selected.

Project IDs must be unique, stable lowercase slugs, e.g. `music-video-title`. They become shareable links like `#project/music-video-title`. In editing, choose format `Long-form` or `Short-form`; in VFX use `VFX`, `Cleanup` or `Motion`. Featured shows a project above the grid in VFX/AI. Project array order controls display order. Turn off `placeholder` when replacing a preview slot with real work. Remove unused slots before public launch.

Use a complete YouTube or Vimeo link, including the privacy hash for unlisted Vimeo videos. Video embedding must be allowed by the owner. MP4 URLs are also supported. Full-size videos should stay on the video platform. Add images under `dist/assets/`; content URLs use `assets/filename.webp`. Add optional breakdown images in the images list.

For SoundCloud, obtain the playlist embed code from Share → Embed and paste only its iframe `src` URL into `soundcloudEmbedUrl`. Retain the private token if present. Test playback while logged out. A playlist embedded in a public site is accessible to visitors; it is not confidential.

## Design and content

Off-white, near-black and cobalt, bold italic display type inspired by the supplied CV. Uses Google Fonts Outfit and DM Sans (with system fallbacks), rather than extracting commercial Futura fonts from the PDF. Abstract home tile graphics are interface artwork, not claimed portfolio work. All sample projects are explicitly marked as layout previews.


## Accessibility and performance

Native dialog with focus containment, Escape/backdrop closing, focus return and playback removal. Mobile full-screen dialogs; reduced-motion support; visible keyboard focus; lazy embedded media. Sound never autoplays. Shareable hash routes work without server rewrites. Project content is escaped before HTML rendering and video hosts are restricted.
