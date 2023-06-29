docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t boolcode/appwrite-funcover:0.0.7  --push .
