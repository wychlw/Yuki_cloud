//config file
const config = {
    'port': 8080,
    'url': '0.0.0.0',

    //Please DO change the 'salt' value
    //Cause the whole security of this system is based on no one can know it
    //If it is been hacked or gained, then the whole software may need reconfig
    //It is REALLY IMPORTANT!!!!
    
    'salt': 'Replace it with something random'
}

module.exports = config;
