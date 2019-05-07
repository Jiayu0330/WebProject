var geoP = d3.json("data/world-countries.json")
var countriesP = d3.csv("data/Percentage_People_Using_Internet.csv")
var economyP = d3.csv("data/GDP.csv")


Promise.all([geoP, countriesP, economyP])
       .then(function(values)
       {
         var geoData = values[0];
         var countries = values[1];
         var economyData = values[2];

         console.log("geoData:", geoData);

         var countriesDict = {}
         var economyDict = {}

         countries.forEach(function(country)
         {
           countriesDict[country.CountryCode] = country; //trim() gets rid of spaces
         })

         economyData.forEach(function(eco)
         {
           economyDict[eco.CountryCode] = eco; //trim() gets rid of spaces
         })

         geoData.features.forEach(function(feature)
         {
           feature.properties.peopleUsingInternet = countriesDict[feature.properties.iso_a3];
           feature.properties.GDP = economyDict[feature.properties.iso_a3];
           //feature.properties.centroids = centroidsDict[feature.properties.iso_a3];
         })

         //console.log(economyDict);

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
  var screen = {width: 1300, height: 650}

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

  // countries.append("text")
  //          .attr("id", "text" + i)
  //          .attr("x", countryGenerator.centroid(d)[0] - countryGenerator.centroid(d)[0] * 0.02)
  //          .attr("y", countryGenerator.centroid(d)[1] + countryGenerator.centroid(d)[1] * 0.02)
  //          .text(d.properties.name)
  //          .attr("font-weight", "bold")
  //          .attr("font-size", 16)
  //          .attr("font-family", "Georgia, serif")

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

             d3.select("#info_country")
                .text(d.properties.name);

             d3.select("#info_year")
               .text("1989");

            //console.log(d.properties.GDP);
            if (d.properties.GDP == undefined || d.properties.GDP.Y1989 == "") {
              d3.select("#info_GDPcapita")
                .text("Undefined");
            }
            else {
              d3.select("#info_GDPcapita")
                .text("$" + Math.round(d.properties.GDP.Y1989));
            }

             d3.select("#info_usage")
               .text("Undefined");

             if (d.properties.economy == "") {
               d3.select("#info_economy")
                 .text("Undefined");
             }
             else {
               d3.select("#info_economy")
                 .text(d.properties.economy);
             }
           })
           .on("mouseout", function(d, i) {
             d3.select("#text" + i).remove();
           });

  //vivid#E58606,#5D69B1,#52BCA3,#99C945,#24796C,#DAA51B,#2F8AC4,#764E9F,#ED645A
  //sunset#f3e79b,#fac484,#f8a07e,#eb7f86,#ce6693,#a059a0,#5c53a5
  // var mapped_economy = geoData.features.map(function(d) {
  //   return {economy: d.properties.economy,
  //           CountryCode: d.properties.iso_a3}
  // });

  //console.log(mapped_economy);
  // for (var i = 0; i < 175; i++) {
  //   var economy = mapped_economy[i].economy;
  //   if (mapped_economy[i].CountryCode == "-99") {
  //     //nothing
  //   }
  //   else {
  //     var countryId = "#" + mapped_economy[i].CountryCode;
  //     var country = d3.select(countryId);
  //     if (economy == "1. Developed region: G7") {country.attr("stroke", "black")}
  //     if (economy == "2. Developed region: nonG7") {country.attr("stroke", "brown")}
  //   }
  // }
  var circleSize = d3.scaleLinear()
                     .domain([0, 185153])
                     .range([0, 120]);

  // countries.append("text")
  //         .attr("id", function(d) {return "circle" + d.properties.iso_a3 + "Text";})
  //         .text("")
  //         .attr("font-style", "italic")
  //         .attr("font-weight", "bold")
  //         .attr("font-size", 14)
  //         .attr("font-family", "Georgia, serif")

  countries.append("circle")
           .attr("class", "circles")
           .attr("id", function(d) {return d.properties.iso_a3 + "C";})
           .attr("cx", function(d) {return countryGenerator.centroid(d)[0] - countryGenerator.centroid(d)[0] * 0.02;})
           .attr("cy", function(d) {return countryGenerator.centroid(d)[1] + countryGenerator.centroid(d)[1] * 0.02;})
           .attr("r", function(d) {
             if (d.properties.GDP == undefined) {return 0;}
             else {
               return circleSize(d.properties.GDP.Y1989);
             }
           })//b9257a 5c53a5
           .attr("fill", "red")
           .attr("opacity", 0.3)
           .on("mouseover", function(d, i) {
             var coordinates= d3.mouse(this);
             var x = coordinates[0];
             var y = coordinates[1];

             svg.append("text")
                .attr("id", "circle" + d.properties.iso_a3 + "Text")
                .attr("x", x)
                .attr("y", y)
                .text(d.properties.name + ": $" + Math.round(d.properties.GDP.Y1989))
                .attr("font-style", "italic")
                .attr("font-weight", "bold")
                .attr("font-size", 14)
                .attr("font-family", "Georgia, serif");

             // d3.select(this)
             //   .append("text")
             //   .attr("id", "#circle" + d.properties.iso_a3 + "Text")
             //   .attr("x", x)
             //   .attr("y", y)
             //   .text(d.properties.name + ": $" + Math.round(d.properties.GDP.Y1989));
             // d3.select("#circle" + d.properties.iso_a3 + "Text")
             //    .attr("x", x)
             //    .attr("y", y)
             //    .text(d.properties.name + ": $" + Math.round(d.properties.GDP.Y1989));

           //info_box
            d3.select("#info_country")
               .text(d.properties.name);

            d3.select("#info_year")
              .text("1989");

           //console.log(d.properties.GDP);
           if (d.properties.GDP.Y1989 == "") {
             d3.select("#info_GDPcapita")
               .text("Undefined");
           }
           else {
             d3.select("#info_GDPcapita")
               .text("$" + Math.round(d.properties.GDP.Y1989));
           }

            d3.select("#info_usage")
              .text("Undefined");

            if (d.properties.economy == "") {
              d3.select("#info_economy")
                .text("Undefined");
            }
            else {
              d3.select("#info_economy")
                .text(d.properties.economy);
            }
           })
           .on("mouseout", function(d, i) {
             d3.select("#circle" + d.properties.iso_a3 + "Text").remove();
           });

  // var color = d3.scaleQuantize()
  //               .range(["#fbe6c5","#f5ba98","#ee8a82","#dc7176","#c8586c","#9c3f5d","#70284a"])
  //               .domain([0, 100]);

  //year label
  // var zoomIn = svg.append("g")
  //                 .attr("class", "zoom")
  //                 .attr("id", "in")
  //                 .attr("transform", "translate(" + (screen.width - 110) +"," + (screen.height - 70) + ")");
  //
  // zoomIn.append("rect")
  //       .attr("x", 0)
  //       .attr("y", 0)
  //       .attr("width", 30)
  //       .attr("height", 30);
  //
  // zoomIn.append("text")
  //       .attr("x", 15)
  //       .attr("y", 22)
  //       .text("+");
  var year = svg.append("g")
                .attr("transform", "translate(" + (screen.width - 718) +"," + (screen.height - 70) + ")");

  year.append("text")
      .attr("id", "year_label")
      .text("Before 1990");

  var mapped = geoData.features.map(function(d) {
    return d.properties.peopleUsingInternet;
  });

  var mapped2 = geoData.features.map(function(d) {
    return d.properties.GDP;
  });

  var timesRun = 0;

  var button = svg.append("svg:image")
                  .attr("xlink:href", "icons/play.png")
                  .attr("class", "play-button")
                  .attr("id", "play")
                  .attr("width", 40)
                  .attr("transform", "translate(50, 50)");

  // button.append("rect")
  //       .attr("x", 0)
  //       .attr("y", 0)
  //       .attr("width", 60)
  //       .attr("height", 30);
  //
  // button.append("text")
  //       .attr("id", "play-button-text")
  //       .attr("x", 16)
  //       .attr("y", 20)
  //       .text("Play")
  //       .attr("font-weight", "bold");

  d3.select(".play-button")
    .on("click", function() {
      var button = d3.select(this);
      //var button = d3.select("#play-button-text");
      var year = d3.select("#year_label");
      if (year.text() == "2016") {
        timesRun = 0;
      }
      var buttonId = document.getElementsByClassName("play-button")[0].id;
      //console.log(buttonId);

      if (buttonId == "pause") {
        clearInterval(timer);
        button.attr("id", "play").attr("xlink:href", "icons/play.png");
      //   var baseYear = 1990;
      //   var currentYear_i = baseYear + timesRun;
      //   var currentYear = "Y" + currentYear_i.toString();
      //   for (var i = 0; i < 175; i++) {
      //     //console.log(mapped[i]);
      //     if (mapped2[i] == undefined) {
      //       //nothing
      //     }
      //     else {
      //       d3.select("#circle" + i.toString())
      //         .text(mapped2[i].CountryName + ": " + Math.round(mapped2[i][currentYear]) + "$");
      //     }
      //   }
      //   timesRun += 1;
      }
      else {
        timer = setInterval(function() {
          animation(mapped, mapped2, timesRun);
          timesRun += 1;
          if (timesRun == 27) {
            clearInterval (timer);
            button.attr("id", "replay").attr("xlink:href", "icons/replay.png");
          }
        }, 500);
        button.attr("id", "pause").attr("xlink:href", "icons/pause.png");
      }
    })

  var animation = function(mapped, mapped2, timesRun) {
    var color = d3.scaleQuantize()
    //mint: "#e4f1e1","#b4d9cc","#89c0b6","#63a6a0","#448c8a","#287274","#0d585f"
    //burg: "#F9F0DE","#fbe6c5","#f5ba98","#ee8a82","#dc7176","#c8586c","#9c3f5d","#70284a"
    //darkmint: "#d2fbd4","#a5dbc2","#7bbcb0","#559c9e","#3a7c89","#235d72","#123f5a"
    //teal: "#d1eeea","#a8dbd9","#85c4c9","#68abb8","#4f90a6","#3b738f","#2a5674"
    //redor: "#f6d2a9","#f5b78e","#f19c7c","#ea8171","#dd686c","#ca5268","#b13f64"
                  .range(["#F9F0DE","#fbe6c5","#f5ba98","#ee8a82","#dc7176","#c8586c","#9c3f5d","#70284a"])
                  .domain([0, 100]);

    var circleSize = d3.scaleLinear()
                       .domain([0, 185153])
                       .range([0, 120]);
    //console.log(mapped.length);
    //console.log(geoData);
    // for (var i = 0; i < 27; i++) {
    //   for (var j = 0; j < 175; j++) {
    var baseYear = 1990;
    var currentYear_i = baseYear + timesRun;
    var currentYear = "Y" + currentYear_i.toString();

    d3.select("#year_label")
      .text(currentYear_i)
      .attr("x", "40");

    d3.select("#info_year")
       .text(currentYear_i)
       .transition();

     // d3.selectAll("circle")
     //   .on("mouseover", function(d, i) {
     //     console.log("halo");
     //     var coordinates= d3.mouse(this);
     //     var x = coordinates[0];
     //     var y = coordinates[1];
     //
     //       //console.log(d3.select(this));
     //
     //     // var circleId = d3.select(this).
     //     //
     //     // d3.select(this)
     //     //   .attr("x", x)
     //     //   .attr("y", y)
     //     //   .text("$" + Math.round(mapped2[number2][currentYear]));
     //   })

     var current_country = d3.select("#info_country").text();
     if (current_country != "") {
       //console.log(current_country);
       var found = false;
       var found2 = false;
        for(var i = 0; i < mapped.length; i++) {
          if (mapped[i] != undefined) {
            if (mapped[i].CountryName == current_country) {
                found = true;
                var number = i;
                break;
            }
          }
        }
          for(var i = 0; i < mapped.length; i++) {
            if (mapped2[i] != undefined) {
              if (mapped2[i].CountryName == current_country) {
                  found2 = true;
                  var number2 = i;
                  break;
              }
            }
          }

        if (mapped2[number2] != undefined) {
          if (mapped2[number2][currentYear] == "") {
            d3.select("#info_GDPcapita")
              .text("Undefined");
          }
          else {d3.select("#info_GDPcapita").text("$" + Math.round(mapped2[number2][currentYear]));}
        }
        //else {d3.select("#info_usage").text("Undefined");}

        if (mapped[number] != undefined) {
          if (mapped[number][currentYear] == "") {
            d3.select("#info_usage")
              .text("Undefined");
          }
          else {d3.select("#info_usage").text(Math.round(mapped[number][currentYear] * 100)/100 + "%");}
        }

        // if (d.properties.economy == "") {
        //   d3.select("#info_economy")
        //     .text("Undefined");
        // }
        // else {
        //   d3.select("#info_economy")
        //     .text(d.properties.economy);
        // }
        //else {d3.select("#info_usage").text("Undefined");}
     }

    for (var i = 0; i < 175; i++) {
      //console.log(mapped[i]);
      if (mapped[i] == undefined || mapped2[i] == undefined) {

      }
      else {
        var countryId = "#" + mapped[i].CountryCode;
        var circleId = "#" + mapped2[i].CountryCode + "C";

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
          .on("mouseover", function(d, i) {
            svg.append("text")
               .attr("id", "text" + i)
               .attr("x", countryGenerator.centroid(d)[0] - countryGenerator.centroid(d)[0] * 0.02)
               .attr("y", countryGenerator.centroid(d)[1] + countryGenerator.centroid(d)[1] * 0.02)
               .text(d.properties.name)
               .attr("font-weight", "bold")
               .attr("font-size", 16)
               .attr("font-family", "Georgia, serif")

            d3.select("#info_country")
               .text(d.properties.name);

            if (d.properties.peopleUsingInternet[currentYear] == "") {
              d3.select("#info_usage")
                .text("Undefined");
            }
            else {
              d3.select("#info_usage")
                .text(Math.round(d.properties.peopleUsingInternet[currentYear] * 100)/100 + "%");
            }

             if (d.properties.GDP[currentYear] == "") {
               d3.select("#info_GDPcapita")
                 .text("Undefined");
             }
             else {
               d3.select("#info_GDPcapita")
                 .text("$" + Math.round(d.properties.GDP[currentYear]));
             }

             if (d.properties.economy == "") {
               d3.select("#info_economy")
                 .text("Undefined");
             }
             else {
               d3.select("#info_economy")
                 .text(d.properties.economy);
             }
          })
          .on("mouseout", function(d, i) {
            d3.select("#text" + i).remove();
          })
          .transition()
          .duration(1000);

        d3.select(circleId)
          .attr("r", function() {
            var value = mapped2[i][currentYear];
            //console.log(i, value)
            if (value == undefined) {
              return 0;
            }
            else {
              //console.log(value);
              return circleSize(value);
            }
          })
          .on("mouseover", function(d, i) {
            var coordinates= d3.mouse(this);
            var x = coordinates[0];
            var y = coordinates[1];

            svg.append("text")
               .attr("id", "circle" + i)
               .attr("x", x)
               .attr("y", y)
               .text(d.properties.name + ": $" + Math.round(d.properties.GDP[currentYear]))
               .attr("font-style", "italic")
               .attr("font-weight", "bold")
               .attr("font-size", 14)
               .attr("font-family", "Georgia, serif")

           //info_box
           d3.select("#info_country")
              .text(d.properties.name);

           if (d.properties.peopleUsingInternet[currentYear] == "") {
             d3.select("#info_usage")
               .text("Undefined");
           }
           else {
             d3.select("#info_usage")
               .text(Math.round(d.properties.peopleUsingInternet[currentYear] * 100)/100 + "%");
           }

            if (d.properties.GDP[currentYear] == "") {
              d3.select("#info_GDPcapita")
                .text("Undefined");
            }
            else {
              d3.select("#info_GDPcapita")
                .text("$" + Math.round(d.properties.GDP[currentYear]));
            }

            if (d.properties.economy == "") {
              d3.select("#info_economy")
                .text("Undefined");
            }
            else {
              d3.select("#info_economy")
                .text(d.properties.economy);
            }
          })
          .on("mouseout", function(d, i) {
            d3.select("#circle" + i).remove();
          })
          .transition()
          .duration(1000);
        //console.log("#circle" + i.toString())
        // d3.select("#circle" + i.toString())
        //   .text(mapped2[i].CountryName + ": " + Math.round(mapped2[i][currentYear]) + "$");
          //mapped2[i].CountryName + ": " + Math.round(mapped2[i][currentYear]) + "$"
      }
    }

        //console.log(timesRun, i);
    // }
  }

  //legend
  var legend_title = svg.append("g")
                        .attr("class", "label");

  legend_title.append("text")
              .attr("x", 1162)
              .attr("y", 62)
              .text("% of People")
              .attr("font-style", "italic")
              .attr("font-size", 15)
              .attr("font-weight", "bold");

  legend_title.append("text")
              .attr("x", 1142)
              .attr("y", 80)
              .text("Using the Internet")
              .attr("font-style", "italic")
              .attr("font-size", 15)
              .attr("font-weight", "bold");

  var colorSet = ["#F9F0DE","#fbe6c5","#f5ba98","#ee8a82","#dc7176","#c8586c","#9c3f5d","#70284a", "#d3d3d3"];
  var description = ["< 12.5","12.5 - 25","25 - 37.5","37.5 - 50", "50 - 62.5", "62.5 - 75", "75 - 87.5", "> 87.5", "Undefined"];
  var legend = svg.append("g")
                  .attr("class", "legend")

  legend.selectAll("rect")
         .data(colorSet)
         .enter()
         .append("rect")
         .attr("x", 1162)
         .attr("y", function(d, i) {return 100 + i*20;})
         .attr("width", 10.5)
         .attr("height", 10.5)
         .attr("fill", function(d) {return d;});

  legend.selectAll("text")
        .data(description)
        .enter()
        .append("text")
        .attr("x", 1182)
        .attr("y", function(d, i) {return 110 + i*20})
        .text(function(d) {return d;})
        .attr("font-size", 15)
        .attr("font-style", "italic")
        .attr("font-weight", "bold");

  var info_box = d3.select("body").append("div").append("svg")
      .attr('width', 230)
      .attr('height', 125)
      .attr('class', 'info_box')
      .attr("transform", "translate(-480, -185)");

  var info_value = info_box.append("g");

  info_value.append("text")
            .attr("x", 5)
            .attr("y", 15)
            .text("Year:")
            .attr("font-size", 14)

  info_value.append("text")
            .attr("x", 40)
            .attr("y", 15)
            .attr("id", "info_year")
            .attr("font-size", 14)
            .attr("text-decoration", "underline")

  info_value.append("text")
            .attr("x", 5)
            .attr("y", 40)
            .text("Country:")
            .attr("font-size", 14)

  info_value.append("text")
            .attr("x", 60)
            .attr("y", 40)
            .attr("id", "info_country")
            .attr("font-size", 14)
            .attr("text-decoration", "underline")

  info_value.append("text")
            .attr("x", 5)
            .attr("y", 65)
            .text("Economy:")
            .attr("font-size", 14)

  info_value.append("text")
            .attr("x", 68)
            .attr("y", 65)
            .attr("id", "info_economy")
            .attr("font-size", 14)
            .attr("text-decoration", "underline")

  info_value.append("text")
            .attr("x", 5)
            .attr("y", 90)
            .text("GDP per capita:")
            .attr("font-size", 14)

  info_value.append("text")
            .attr("x", 100)
            .attr("y", 90)
            .attr("id", "info_GDPcapita")
            .attr("font-size", 14)
            .attr("text-decoration", "underline")

  info_value.append("text")
            .attr("x", 5)
            .attr("y", 115)
            .text("People using the Internet:")
            .attr("font-size", 14)

  info_value.append("text")
            .attr("x", 155)
            .attr("y", 115)
            .attr("id", "info_usage")
            .attr("font-size", 14)
            .attr("text-decoration", "underline")

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
    .on("click", function(d)
    {
      var offset = projection.translate(); //get current translation offset
      var moveAmount = 80; //how much to move on each click
      var direction = d3.select(this).attr("id"); //which Norway

      // var x = 0;
			// var y = 0;

      switch(direction)
      {
        case "north":
            offset[1] += moveAmount;
            //y += moveAmount;
            break;
        case "south":
            offset[1] -= moveAmount;
            //y -= moveAmount;
            break;
        case "west":
            offset[0] += moveAmount;
            //x += moveAmount;
            break;
        case "east":
            offset[0] -= moveAmount;
            //x -= moveAmount;
            break;
        default:
            break;
      }

      projection.translate(offset);
      // map.transition()
			// 	 .call(zoom.translateBy, x, y);

      svg.selectAll("path")
         .transition()
         .attr("d", countryGenerator);

     svg.selectAll("circle")
        .transition()
        .attr("cx", function(d) {return countryGenerator.centroid(d)[0];})
        .attr("cy", function(d) {return countryGenerator.centroid(d)[1];})
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
  //  svg.selectAll("circle")
  //     .transition()
  //     .attr("cx", function(d) {return countryGenerator.centroid(d)[0];})
  //     .attr("cy", function(d) {return countryGenerator.centroid(d)[1];})
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
  // //
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

    svg.selectAll("circle")
       .transition()
       .attr("cx", function(d) {return countryGenerator.centroid(d)[0];})
       .attr("cy", function(d) {return countryGenerator.centroid(d)[1];})
  }

  var zoom = d3.zoom()
               // .scaleExtent([ 0.2, 2.0 ])
               // .translateExtent([[ -1200, -700 ], [ 1200, 700 ]])
               .on("zoom", zooming);

  var center = [screen.width/2, screen.height/2];
  //console.log(center);

  var map = svg.append("g")
               .attr("id", "zoomingMap")
               .call(zoom)
               .call(zoom.transform, d3.zoomIdentity
                   .translate(screen.width/2 + 25, screen.height/2 + 60)
                   .scale(0.115)
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
