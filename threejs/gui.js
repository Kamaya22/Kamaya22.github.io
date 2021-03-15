


function setUpGui()
{   
    //Loading the json file
    canvas.onload = function(){
        $.get("data.json", function(data){
            console.log(data);
        });
    }

    //Definition of the controllers
    effectController = {
        mensaje : console.log(data[planet]["fun fact"]),
        planet : []
    }
    //Creation of the interface
    var gui = new dat.GUI({
        height = 2*32 - 1
    });
    //Construction of menu
    var menu = gui.addFolder("Control infos on planets");
    menu.add(effectController, 'planet', {Mercury:0, Venus:1, Earth:2, Mars:3, Jupiter:4, Saturn:5, Uranus:6, Neptune:7}).name("Planet")
    menu.add(effectController, 'mensaje').name("Fun Fact")
    
}


