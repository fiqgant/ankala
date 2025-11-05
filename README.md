# Yeahhhh
## Ankala

### Unsplash integration
- Set `VITE_UNSPLASH_ACCESS_KEY` in your `.env` (see Unsplash dashboard).
- We hotlink Unsplash images directly and trigger the official download endpoint so usage counts correctly.
- Each image now renders attribution links (`Photo by … on Unsplash`) as required by their API guidelines.
- Keep your Unsplash secret key private; only the access key belongs in the client.
