#!/usr/bin/env bash
# Cópia lógica do banco (mysqldump) para a própria VM, com rotação de 7 dias. É um extra: o Azure Database for MySQL
# já faz backups automáticos. Baixe os arquivos de deploy/backups para fora da VM de vez em quando (scp).
#   bash scripts/backup-mysql.sh
# Agendamento diário às 03:00:  (crontab -e)  0 3 * * * bash /opt/trilho/deploy/scripts/backup-mysql.sh >> /opt/trilho/deploy/backups/cron.log 2>&1
set -euo pipefail

cd "$(dirname "$0")/.."   # pasta deploy/

get() { grep -E "^$1=" .env | head -1 | cut -d= -f2-; }
host="$(get DB_HOST)"; port="$(get DB_PORT)"; name="$(get DB_NAME)"; user="$(get DB_USER)"; password="$(get DB_PASSWORD)"

mkdir -p backups
file="backups/trilho-$(date +%F-%H%M).sql.gz"

# O cliente do MySQL roda em contêiner (a VM não precisa instalá-lo). A senha vai por variável de ambiente, não pela linha de comando.
docker run --rm -e MYSQL_PWD="$password" mysql:8.0 \
  mysqldump --single-transaction --routines --default-character-set=utf8mb4 --ssl-mode=REQUIRED \
  -h "$host" -P "${port:-3306}" -u "$user" "${name:-trilhodb}" | gzip > "$file"

find backups -name 'trilho-*.sql.gz' -mtime +7 -delete
echo "Backup salvo em deploy/$file ($(du -h "$file" | cut -f1))"
