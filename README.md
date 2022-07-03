# angelbadge
angelbadge for MCH2022

For Pebble3 printer

requirements: Linux with Pebble3 driver installed and configured for right type of ribbon, and see requirements.txt

Font is licensed under Open Font License: https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL

Code: see license.txt (basically i don't care what you do with my code)

![plaatje](/example.png)

Repo contains a hacked version of the MCH2022 design generator, find original here: https://gitlab.com/stitch1/mch2021designgenerator , am too uninterested to do it properly with forks and submodules and whatnot.

## Basis install notes
sudo apt update && sudo apt upgrade

### NodeJS installeren:

#### Using Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

#### Using Debian, as root
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

### Other stuff like dependencies and drivers
sudo apt install git vim python3-pip

git clone https://github.com/sebastius/angelbadge.git
cd angelbadge
git submodule update —init
pip install -r requirements.txt

cd evolis_pebble_driver
sudo dpkg -i blabla.deb

Install printer

### Go time
./start.sh
