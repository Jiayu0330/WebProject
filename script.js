var geoP = d3.json("data/world-countries.json")
var countriesP = d3.csv("data/Percentage_People_Using_Internet.csv")


Promise.all([geoP, countriesP])
       .then(function(values)
       {
         var geoData = values[0];
         var countries = values[1];

         console.log("geoData:", geoData);

         var countriesDict = {}
         countries.forEach(function(country)
         {
           countriesDict[country.CountryCode] = country; //trim() gets rid of spaces
         })

         geoData.features.forEach(function(feature)
         {
           feature.properties.peopleUsingInternet = countriesDict[feature.properties.iso_a3];
         })

         //console.log(countriesDict);

         drawMap(geoData);
       })


// geoP.then(function(geoData)
// {
//   console.log(geoData);
//   drawMap(geoData);
// },
// function(err) {
//   console.log(err);
// })


var drawMap = function(geoData)
{
  var screen = {width: 1200, height: 650}

  var projection = d3.geoEqualEarth()
                     .translate([screen.width/2, screen.height/2])
                     .scale([220]);

  var countryGenerator = d3.geoPath()
                         .projection(projection);

  //console.log("coord", projection([-85, 35]));

  var svg = d3.select("body")
              .append("svg")
              .attr("width", screen.width)
              .attr("height", screen.height);

  // svg.selectAll("path")
  //    .data(geoData.features)
  //    .enter()
  //    .append("path")
  //    .attr("d", countryGenerator);

  var countries = svg.append("g")
                  .attr("id", "countries")
                  .selectAll("g")
                  .data(geoData.features) //array
                  .enter()
                  .append("g")
                  .classed("country", true);

  countries.append("path")
           .attr("d", countryGenerator)
           .attr("id", function(d) {return d.properties.iso_a3;})
           .attr("stroke", "black")
           .attr("fill", "white")
           .on("mouseover", function(d, i) {
             // var path = d3.select(this)._groups[0][0];
             // console.log(path);
             svg.append("text")
                .attr("id", "text" + i)
                .attr("x", countryGenerator.centroid(d)[0] - countryGenerator.centroid(d)[0] * 0.02)
                .attr("y", countryGenerator.centroid(d)[1] + countryGenerator.centroid(d)[1] * 0.02)
                .text(d.properties.name)
                .attr("font-weight", "bold")
                .attr("font-size", 16)
                .attr("font-family", "Georgia, serif")
           })
           .on("mouseout", function(d, i) {
             d3.select("#text" + i).remove();
           });

  // var color = d3.scaleQuantize()
  //               .range(["#fbe6c5","#f5ba98","#ee8a82","#dc7176","#c8586c","#9c3f5d","#70284a"])
  //               .domain([0, 100]);

  //year label
  svg.append("text")
     .attr("id", "year_label")
     .attr("x", screen.width/2 - 68)
     .attr("y", screen.height - 70)
     .text("Before 1990")

  var mapped = geoData.features.map(function(d) {
    return d.properties.peopleUsingInternet;
  });
  //console.log("mapped array:", mapped);

  var timesRun = 0;

  d3.select("#play-button")
    .on("click", function() {
      var button = d3.select(this);
      var year = d3.select("#year_label");
      if (year.text() == "2016") {
        timesRun = 0;
      }
      if (button.text() == "Pause") {
        clearInterval(timer);
        button.text("Play");
      }
      else {
        timer = setInterval(function() {
          animation(mapped, timesRun);
          timesRun += 1;
          if (timesRun == 27) {
            clearInterval (timer);
            button.text("Replay");
          }
        }, 500);
        button.text("Pause");
      }
    })

  var animation = function(mapped, timesRun) {
    var color = d3.scaleQuantize()
                  .range(["#F9F0DE","#fbe6c5","#f5ba98","#ee8a82","#dc7176","#c8586c","#9c3f5d","#70284a"])
                  .domain([0, 98.4]);
    //console.log(mapped.length);
    //console.log(geoData);
    // for (var i = 0; i < 27; i++) {
    //   for (var j = 0; j < 175; j++) {
    var baseYear = 1990;
    var currentYear_i = baseYear + timesRun;
    var currentYear = "Y" + currentYear_i.toString();

    d3.select("#year_label")
      .text(currentYear_i)
      .attr("x", 573);

    for (var i = 0; i < 175; i++) {
      //console.log(mapped[i]);
      if (mapped[i] == undefined) {
        //nothing
      }
      else {
        var countryId = "#" + mapped[i].CountryCode;
        d3.select(countryId)
          .attr("fill", function() {
            var value = mapped[i][currentYear];
            //console.log(i, value)
            if (value == "") {
              return "lightGrey";
            }
            else {
              //console.log(value);
              return color(value);
            }
          })
          .transition()
          .duration(1000)
      }
    }

        //console.log(timesRun, i);
    // }
  }

  //Panning the map
  var panning = 30;
  //up
  var north = svg.append("g")
                 .attr("class", "pan")
                 .attr("id", "north");

  north.append("rect")
       .attr("id", "north_rect")
       .attr("x", 0)
       .attr("y", 0)
       .attr("width", screen.width)
       .attr("height", panning)
       .attr("fill", "#931621")
       .attr("opacity", 0.2)
       .on("mouseover", function() {
         var arrow = d3.select("#north_arrow")
         arrow.attr("width", 40)
              .attr("x", screen.width/2 - 20)
              .attr("y", panning - 35)
       })
       .on("mouseout", function() {
         var arrow = d3.select("#north_arrow")
         arrow.attr("width", 32)
              .attr("x", screen.width/2 - 16)
              .attr("y", panning - 30)
       });

  north.append("svg:image")
       .attr("xlink:href", "icons/up.png")
       .attr("id", "north_arrow")
       .attr("x", screen.width/2 - 16)
       .attr("y", panning - 30)
       .attr("width", 32)
       .on("mouseover", function() {
         var rect = d3.select("#north_rect")
         rect.attr("opacity", "0.4");
         var arrow = d3.select("#north_arrow")
         arrow.attr("width", 40)
              .attr("x", screen.width/2 - 20)
              .attr("y", panning - 35)
       })
       .on("mouseout", function() {
         var rect = d3.select("#north_rect")
         rect.attr("opacity", "0.2");
         var arrow = d3.select("#north_arrow")
         arrow.attr("width", 32)
              .attr("x", screen.width/2 - 16)
              .attr("y", panning - 30)
       });

  //down
  var south = svg.append("g")
                .attr("class", "pan")
                .attr("id", "south");

  south.append("rect")
      .attr("id", "south_rect")
      .attr("x", 0)
      .attr("y", screen.height - panning)
      .attr("width", screen.width)
      .attr("height", panning)
      .attr("fill", "#931621")
      .attr("opacity", 0.2)
      .on("mouseover", function() {
        var arrow = d3.select("#south_arrow")
        arrow.attr("width", 40)
             .attr("x", screen.width/2 - 20)
             .attr("y", screen.height - 35)
      })
      .on("mouseout", function() {
        var arrow = d3.select("#south_arrow")
        arrow.attr("width", 32)
             .attr("x", screen.width/2 - 16)
             .attr("y", screen.height - 30)
      });

  south.append("svg:image")
       .attr("xlink:href", "icons/down.png")
       .attr("id", "south_arrow")
       .attr("x", screen.width/2 - 16)
       .attr("y", screen.height - 30)
       .attr("width", "32")
       .on("mouseover", function() {
         var rect = d3.select("#south_rect")
         rect.attr("opacity", "0.4");
         var arrow = d3.select("#south_arrow")
         arrow.attr("width", 40)
              .attr("x", screen.width/2 - 20)
              .attr("y", screen.height - 35)
       })
       .on("mouseout", function() {
         var rect = d3.select("#south_rect")
         rect.attr("opacity", "0.2");
         var arrow = d3.select("#south_arrow")
         arrow.attr("width", 32)
              .attr("x", screen.width/2 - 16)
              .attr("y", screen.height - 30)
       });

  //west
  var west = svg.append("g")
                .attr("class", "pan")
                .attr("id", "west");

  west.append("rect")
      .attr("id", "west_rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", panning)
      .attr("height", screen.height)
      .attr("fill", "#931621")
      .attr("opacity", 0.2)
      .on("mouseover", function() {
        var arrow = d3.select("#west_arrow")
        arrow.attr("width", 40)
             .attr("x", -6)
             .attr("y", screen.height/2 - 36)
      })
      .on("mouseout", function() {
        var arrow = d3.select("#west_arrow")
        arrow.attr("width", 32)
             .attr("x", -2)
             .attr("y", screen.height/2 - 32)
      });

  west.append("svg:image")
       .attr("xlink:href", "icons/left.png")
       .attr("id", "west_arrow")
       .attr("x", -2)
       .attr("y", 293)
       .attr("width", "32")
       .on("mouseover", function() {
         var rect = d3.select("#west_rect")
         rect.attr("opacity", "0.4");
         var arrow = d3.select("#west_arrow")
         arrow.attr("width", 40)
              .attr("x", -6)
              .attr("y", screen.height/2 - 36)
       })
       .on("mouseout", function() {
         var rect = d3.select("#west_rect")
         rect.attr("opacity", "0.2");
         var arrow = d3.select("#west_arrow")
         arrow.attr("width", 32)
              .attr("x", -2)
              .attr("y", screen.height/2 - 32)
       });

  //east
  var east = svg.append("g")
                .attr("class", "pan")
                .attr("id", "east");

  east.append("rect")
      .attr("id", "east_rect")
      .attr("x", screen.width - panning)
      .attr("y", 0)
      .attr("width", panning)
      .attr("height", screen.height)
      .attr("fill", "#931621")
      .attr("opacity", 0.2)
      .on("mouseover", function() {
        var arrow = d3.select("#east_arrow")
        arrow.attr("width", 40)
             .attr("x", screen.width - 33)
             .attr("y", screen.height/2 - 36)
      })
      .on("mouseout", function() {
        var arrow = d3.select("#east_arrow")
        arrow.attr("width", 32)
             .attr("x", screen.width - 29)
             .attr("y", screen.height/2 - 32)
      });

  east.append("svg:image")
       .attr("xlink:href", "icons/right.png")
       .attr("id", "east_arrow")
       .attr("x", screen.width - 29)
       .attr("y", screen.height/2 - 32)
       .attr("width", 32)
       .on("mouseover", function() {
         var rect = d3.select("#east_rect")
         rect.attr("opacity", "0.4");
         var arrow = d3.select("#east_arrow")
         arrow.attr("width", 40)
              .attr("x", screen.width - 33)
              .attr("y", screen.height/2 - 36)
       })
       .on("mouseout", function() {
         var rect = d3.select("#east_rect")
         rect.attr("opacity", "0.2");
         var arrow = d3.select("#east_arrow")
         arrow.attr("width", 32)
              .attr("x", screen.width - 29)
              .attr("y", screen.height/2 - 32)
       });

  d3.selectAll(".pan")
    .on("click", function()
    {
      var offset = projection.translate(); //get current translation offset
      var moveAmount = 90; //how much to move on each click
      var direction = d3.select(this).attr("id"); //which Norway

      switch(direction)
      {
        case "north":
            offset[1] += moveAmount;
            break;
        case "south":
            offset[1] -= moveAmount;
            break;
        case "west":
            offset[0] += moveAmount;
            break;
        case "east":
            offset[0] -= moveAmount;
            break;
        default:
            break;
      }

      projection.translate(offset);

      svg.selectAll("path")
         .transition()
         .attr("d", countryGenerator);

      // svg.selectAll("#countryAbbrev")
      //    .transition()
      //    .attr("x", function(d) {return countryGenerator.centroid(d)[0];})
      //    .attr("y", function(d) {return countryGenerator.centroid(d)[1];})
    });

  // //dragging the map
  // var dragging = function(d) {
  //   //console.log("dragging!");
  //   //console.log(d3.event);
  //   var offset = projection.translate();
  //
  //   offset[0] += d3.event.dx;
  //   offset[1] += d3.event.dy;
  //
  //   projection.translate(offset);
  //
  //   svg.selectAll("path")
  //      .transition()
  //      .attr("d", countryGenerator);
  //
  //   svg.selectAll("#countryAbbrev")
  //      .transition()
  //      .attr("x", function(d) {return countryGenerator.centroid(d)[0];})
  //      .attr("y", function(d) {return countryGenerator.centroid(d)[1];})
  // }
  //
  // var drag = d3.drag()
  //              .on("drag", dragging);
  //
  // var map = svg.append("g")
  //              .attr("id", "draggingMap")
  //              .call(drag);
  //
  // map.append("rect")
  //    .attr("x", panning)
  //    .attr("y", panning)
  //    .attr("width", screen.width - panning * 2)
  //    .attr("height", screen.height - panning * 2)
  //    .attr("opacity", 0)
  //    .attr("cursor", "move");
  //
  //zooming the map
  var zooming = function(d) {
    //console.log(d3.event.transform);

    var offset = [d3.event.transform.x, d3.event.transform.y];

    var newScale = d3.event.transform.k * 2000;

    projection.translate(offset)
              .scale(newScale);

    svg.selectAll("path")
       .transition()
       .attr("d", countryGenerator);

    // svg.selectAll("#countryAbbrev")
    //    .transition()
    //    .attr("x", function(d) {return countryGenerator.centroid(d)[0];})
    //    .attr("y", function(d) {return countryGenerator.centroid(d)[1];})
  }

  var zoom = d3.zoom()
               .on("zoom", zooming);

  var center = projection([30, 30]);
  //console.log(center);

  var map = svg.append("g")
               .attr("id", "zoomingMap")
               .call(zoom)
               .call(zoom.transform, d3.zoomIdentity
                   .translate(screen.width/2, screen.height/2 + 60)
                   .scale(0.12)
                   .translate(-center[0], -center[1]));

  // map.append("rect")
  //    .attr("x", panning)
  //    .attr("y", panning)
  //    .attr("width", screen.width - panning * 2)
  //    .attr("height", screen.height - panning * 2)
  //    .attr("opacity", 0)
     //.attr("cursor", "move")

  //create zoom buttons
  //zoom in button
  var zoomIn = svg.append("g")
                  .attr("class", "zoom")
                  .attr("id", "in")
                  .attr("transform", "translate(" + (screen.width - 110) +"," + (screen.height - 70) + ")");

  zoomIn.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 30)
        .attr("height", 30);

  zoomIn.append("text")
        .attr("x", 15)
        .attr("y", 22)
        .text("+");

  //zoom out button
  var zoomOut = svg.append("g")
                  .attr("class", "zoom")
                  .attr("id", "out")
                  .attr("transform", "translate(" + (screen.width - 70) +"," + (screen.height - 70) + ")");

  zoomOut.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 30)
        .attr("height", 30);

  zoomOut.append("text")
        .attr("x", 15)
        .attr("y", 20)
        .html("&ndash;");

  d3.selectAll(".zoom")
    .on("click", function() {
      var scaleFactor;
      var direction = d3.select(this).attr("id");

      switch (direction) {
              case "in":
                      scaleFactor = 1.5;
                      break;
              case "out":
                      scaleFactor = 0.75;
                      break;
              default:
                      break;
      }

      map.transition()
    		 .call(zoom.scaleBy, scaleFactor);
    })

}
