#!/usr/bin/env bash
# Atualiza e sobe o Trilho na VM: baixa a imagem da API, sobe os contêineres e espera a API ficar saudável.
#   bash scripts/deploy.sh                  # usa API_IMAGE do .env (padrão: ghcr.io/uscs-ads/trilho-api:latest)
#   bash scripts/deploy.sh sha-1a2b3c4      # sobe uma versão específica (tag publicada pelo workflow Backend CI)
set -euo pipefail

cd "$(dirname "$0")/.."   # pasta deploy/

if [ ! -f .env ]; then
  echo "Falta deploy/.env — copie de .env.prod.example e preencha." >&2
  exit 1
fi

if [ "${1:-}" != "" ]; then
  image_base="$(grep -E '^API_IMAGE=' .env | head -1 | cut -d= -f2- | sed 's/:[^:/]*$//')"
  image_base="${image_base:-ghcr.io/uscs-ads/trilho-api}"
  export API_IMAGE="${image_base}:$1"
  echo "==> Versão pedida: ${API_IMAGE}"
fi

echo "==> Baixando a imagem"
docker compose pull

echo "==> Subindo os serviços"
docker compose up -d

echo "==> Esperando a API ficar saudável (migrations e seed rodam na primeira subida)"
for attempt in $(seq 1 40); do
  status="$(docker inspect --format '{{.State.Health.Status}}' "$(docker compose ps -q api)" 2>/dev/null || echo starting)"
  [ "$status" = "healthy" ] && break
  sleep 3
done
if [ "$status" != "healthy" ]; then
  echo "A API não ficou saudável. Últimas linhas do log:" >&2
  docker compose logs --tail 60 api >&2
  exit 1
fi

host="$(grep -E '^API_HOST=' .env | head -1 | cut -d= -f2-)"
echo "==> API saudável. Conferindo https://${host}/health/ready"
curl -fsS --max-time 20 "https://${host}/health/ready" && echo " ok" || echo "(o certificado pode levar um minuto para ser emitido; tente de novo)"

docker image prune -f >/dev/null
docker compose ps
