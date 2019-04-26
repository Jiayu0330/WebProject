var geoP = d3.json("data/world-countries.json")
var countriesP = d3.csv("data/Percentage_People_Using_Internet.csv")


Promise.all([geoP, countriesP])
       .then(function(values)
       {
         var geoData = values[0];
         var countries = values[1];

         console.log(geoData);

         var countriesDict = {}
         countries.forEach(function(country)
         {
           countriesDict[country.CountryCode] = country; //trim() gets rid of spaces
         })

         geoData.features.forEach(function(feature)
         {
           feature.properties.peopleUsingInternet = countriesDict[feature.properties.brk_a3];
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
           .attr("id", function(d) {return d.properties.brk_a3;})
           .attr("stroke", "black")
           .attr("fill", "white")
           .on("mouseover", function(d, i) {
             // var path = d3.select(this)._groups[0][0];
             // console.log(path);
             svg.append("g")
                .append("text")
                .attr("id", "text" + i)
                .attr("x", countryGenerator.centroid(d)[0] - countryGenerator.centroid(d)[0] * 0.02)
                .attr("y", countryGenerator.centroid(d)[1] + countryGenerator.centroid(d)[1] * 0.02)
                .text(d.properties.name);
           })
           .on("mouseout", function(d, i) {
             d3.select("#text" + i).remove();
           });

  // var color = d3.scaleQuantize()
  //               .range(["#fbe6c5","#f5ba98","#ee8a82","#dc7176","#c8586c","#9c3f5d","#70284a"])
  //               .domain([0, 100]);

  var mapped = geoData.features.map(function(d) {
    return d.properties.peopleUsingInternet;
  });
  //console.log("mapped array:", mapped);

  d3.select("#CHN")
    .on("click", function() {
      var timesRun = 0;
      var interval = setInterval(function() {
        timesRun += 1;
        if (timesRun == 26) {
          clearInterval (interval);
        }
        animation(mapped, timesRun);
      }, 500);
    })

  var animation = function(mapped, timesRun) {
    var color = d3.scaleQuantize()
                  .range(["#fbe6c5","#f5ba98","#ee8a82","#dc7176","#c8586c","#9c3f5d","#70284a"])
                  .domain([0, 100]);
    //console.log(mapped.length);
    //console.log(geoData);
    // for (var i = 0; i < 27; i++) {
    //   for (var j = 0; j < 175; j++) {
    for (var i = 0; i < 175; i++) {
      //console.log(mapped[i]);
          if (mapped[i] == undefined) {
            //do nothing
          }
          else {
            var countryId = "#" + mapped[i].CountryCode;
            d3.select(countryId)
              .attr("fill", function() {
                var baseYear = 1990;
                var currentYear = baseYear + timesRun;
                currentYear = "Y" + currentYear.toString();
                var value = mapped[i][currentYear];
                  //console.log(j, value);
                if (value == undefined) {
                  return "white";
                }
                else {
                  //console.log(value);
                  return color(value);
                }
              })
              .transition()
              .duration(600)
          }
    }

        console.log(timesRun, i);
    // }
  }

  //Panning the map
  var panning = 30;
  //up
  var north = svg.append("g")
                 .attr("class", "pan")
                 .attr("id", "north");

  north.append("rect")
       .attr("x", 0)
       .attr("y", 0)
       .attr("width", screen.width)
       .attr("height", panning)
       .attr("fill", "grey")
       .attr("opacity", 0.4);

  north.append("text")
       .attr("x", screen.width/2)
       .attr("y", panning - 10)
       .html("&uarr;"); //arrow

  //down
  var south = svg.append("g")
                .attr("class", "pan")
                .attr("id", "south");

  south.append("rect")
      .attr("x", 0)
      .attr("y", screen.height - panning)
      .attr("width", screen.width)
      .attr("height", panning)
      .attr("fill", "grey")
      .attr("opacity", 0.4);

  south.append("text")
      .attr("x", screen.width/2)
      .attr("y", screen.height - 10)
      .html("&darr;"); //arrow

  //west
  var west = svg.append("g")
                .attr("class", "pan")
                .attr("id", "west");

  west.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", panning)
      .attr("height", screen.height)
      .attr("fill", "grey")
      .attr("opacity", 0.4);

  west.append("text")
      .attr("x", 15)
      .attr("y", screen.height/2)
      .html("&larr;"); //arrow

  //east
  var east = svg.append("g")
                .attr("class", "pan")
                .attr("id", "east");

  east.append("rect")
      .attr("x", screen.width - panning)
      .attr("y", 0)
      .attr("width", panning)
      .attr("height", screen.height)
      .attr("fill", "grey")
      .attr("opacity", 0.4);

  east.append("text")
      .attr("x", screen.width - 15)
      .attr("y", screen.height/2)
      .html("&rarr;"); //arrow

  d3.selectAll(".pan")
    .on("click", function()
    {
      var offset = projection.translate(); //get current translation offset
      var moveAmount = 50; //how much to move on each click
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
