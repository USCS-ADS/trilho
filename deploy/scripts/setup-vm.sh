#!/usr/bin/env bash
# Prepara uma VM Ubuntu 24.04 (mesmo com 1 GB de RAM) para rodar o Trilho: swap, Docker, firewall, fail2ban e atualizações automáticas.
# Rode UMA vez, como usuário comum com sudo:   bash setup-vm.sh
set -euo pipefail

if [ "$(id -u)" -eq 0 ]; then
  echo "Rode como usuário comum (com sudo), não como root." >&2
  exit 1
fi

echo "==> Atualizando pacotes"
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "==> Swap de 2 GB (a VM tem pouca RAM; evita que o .NET seja encerrado por falta de memória)"
if ! swapon --show | grep -q '/swapfile'; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-trilho-swap.conf >/dev/null
sudo sysctl --system >/dev/null

echo "==> Docker Engine + Compose"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sudo sh
fi
sudo usermod -aG docker "$USER"

echo "==> Firewall (ufw): só SSH, HTTP e HTTPS"
sudo apt-get install -y ufw fail2ban unattended-upgrades git
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw --force enable

echo "==> fail2ban (bloqueia tentativas de força bruta no SSH) e atualizações de segurança automáticas"
sudo systemctl enable --now fail2ban
sudo dpkg-reconfigure -f noninteractive unattended-upgrades

echo "==> Pasta do projeto"
sudo mkdir -p /opt/trilho
sudo chown "$USER":"$USER" /opt/trilho

cat <<'EOF'

Pronto. Próximos passos:
  1. Saia e entre de novo no SSH (para o grupo "docker" valer).
  2. git clone https://github.com/USCS-ADS/trilho.git /opt/trilho   (ou git -C /opt/trilho pull, se já existir)
  3. cd /opt/trilho/deploy && cp .env.prod.example .env && nano .env
  4. bash scripts/deploy.sh
Lembre de liberar as portas 80 e 443 também na regra de rede (NSG) da Azure.
EOF
