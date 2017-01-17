#!/bin/sh
# Grabs latest code from github, builds and executes.
# move this file to: /usr/local/src and chmod +x raspy-build.sh
#

clear

SRC_DIR="/usr/local/src/raspy"

echo "Stopping raspy..."
sudo systemctl stop raspy.service

echo "Gitting latest code..."

sudo rm -rf $SRC_DIR
sudo git clone https://github.com/zoroloco/raspy.git $SRC_DIR

echo "Now installing dependencies..."
cd $SRC_DIR
sudo npm install

echo "making scripts executable..."
sudo chmod +x $SRC_DIR/app/scripts/shell/raspy-run.sh
sudo chmod +x $SRC_DIR/app/scripts/shell/raspy-update.sh

echo "moving and updating startup daemon script..."
#sudo rm -rf /usr/lib/systemd/system/raspy.service
sudo chmod +x $SRC_DIR/app/scripts/shell/raspy.service
sudo cp $SRC_DIR/app/scripts/shell/raspy.service /usr/lib/systemd/system/
cd /etc/systemd/system
sudo ln -s /usr/lib/systemd/system/raspy.service ./raspy.service
sudo systemctl daemon-reload

echo "Now changing permissions and running raspy..."
sudo chmod +x $SRC_DIR/app/scripts/shell/raspy-run.sh
sudo systemctl start raspy.service
#sudo $SRC_DIR/scripts/shell/druidia-run.sh