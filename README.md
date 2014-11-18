Strato Data portal
=======
A refresh of the original Strato ([welldone/strato](http://github.com/WellDone/Strato)), this time 100x cleaner and 10x better.

# Installation (Ubuntu)

```shell
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y git nodejs
sudo npm install -g bower gulp

git clone https://www.github.com/welldone/strato2
cd strato2
npm install
bower install
gulp
npm start &
```