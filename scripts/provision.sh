apt-get update
apt-get install -y nginx git

apt-get install -y python-software-properties python g++ make
add-apt-repository ppa:chris-lea/node.js
apt-get update
apt-get install -y nodejs

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-get update
sudo apt-get install -y mongodb-org

if [ "$1" == "production" ]; then
	git clone https://www.github.com/welldone/strato2.git /welldone
else
	rm /welldone
	if [ -d "/vagrant" ]; then
		ln -s /vagrant /welldone
	fi
fi

if [ ! -d "/welldone" ]; then
	echo "No /welldone directory found."
	exit 1
fi

cd /welldone
npm install

ln -fs /welldone/scripts/upstart.conf /etc/init/strato.conf
initctl reload-configuration
service start strato

ln -fs /welldone/scripts/nginx.cfg /etc/nginx/sites-enabled/default
sudo /etc/init.d/nginx restart