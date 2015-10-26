VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.network "forwarded_port", guest: 3000, host: (ENV["WEB_PORT"] || 3000)
  config.vm.network "forwarded_port", guest: 27017, host: (ENV["MONGO_PORT"] || 27017)

  config.vm.provision "shell", path: "scripts/provision.sh"
end
