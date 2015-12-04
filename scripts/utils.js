function getPearsonsCorrelation(x, y) {
    var shortestArrayLength = 0;
    if (x.length == y.length) {
        shortestArrayLength = x.length;
    } else if (x.length > y.length) {
        shortestArrayLength = y.length;
        console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
    } else {
        shortestArrayLength = x.length;
        console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
    }

    var xy = [];
    var x2 = [];
    var y2 = [];

    for (var i = 0; i < shortestArrayLength; i++) {
        xy.push(x[i] * y[i]);
        x2.push(x[i] * x[i]);
        y2.push(y[i] * y[i]);
    }

    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_x2 = 0;
    var sum_y2 = 0;

    for (i = 0; i < shortestArrayLength; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += xy[i];
        sum_x2 += x2[i];
        sum_y2 += y2[i];
    }

    var step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
    var step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
    var step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
    var step4 = Math.sqrt(step2 * step3);
    var answer = step1 / step4;

    if (isNaN(answer)) return 0;
    return answer;
}

function findLineByLeastSquares(values_x, values_y) {
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var count = 0;

    /*
     * We'll use those variables for faster read/write access.
     */
    var x = 0;
    var y = 0;
    var values_length = values_x.length;

    if (values_length != values_y.length) {
        throw new Error('The parameters values_x and values_y need to have same size!');
    }

    /*
     * Nothing to do.
     */
    if (values_length === 0) {
        return [
            [],
            []
        ];
    }

    /*
     * Calculate the sum for each of the parts necessary.
     */
    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = values_y[v];
        sum_x += x;
        sum_y += y;
        sum_xx += x * x;
        sum_xy += x * y;
        count++;
    }

    /*
     * Calculate m and b for the formular:
     * y = x * m + b
     */
    var m = (count * sum_xy - sum_x * sum_y) / (count * sum_xx - sum_x * sum_x);
    var b = (sum_y / count) - (m * sum_x) / count;

    /*
     * We will make the x and y result line now
     */
    var result_values_x = [];
    var result_values_y = [];

    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = x * m + b;
        result_values_x.push(x);
        result_values_y.push(y);
    }

    return [result_values_x, result_values_y];
}

var getMonthName = function(number) {
    switch (number) {
        case 1:
            return "January";
        case 2:
            return "Febuary";
        case 3:
            return "March";
        case 4:
            return "April";
        case 5:
            return "May";
        case 6:
            return "June";
        case 7:
            return "July";
        case 8:
            return "August";
        case 9:
            return "September";
        case 10:
            return "October";
        case 11:
            return "November";
        case 12:
            return "December";
        default:
            return null;
    }
};

////
//// Map
////

var WorldType = {
  EQUIDISTANT: 1,
  EQUIRECTANGULAR: 2,
  EUROPE: 3,
};

function World(worldType, world, names) {
    var self = this;

    ////
    //// Projection
    ////

    var width, height,
        projection,
        rotatable, // Rotates map on country selection
        attribute; // Page attribute to append map

    // Task 4
    if (worldType == WorldType.EQUIDISTANT) {
        width = 450, height = 450;
        rotatable = true;
        attribute = "#world-equidistant";
        projection = d3.geo.azimuthalEquidistant()
            .scale(100)
            .translate([width / 2, height / 2])
            .clipAngle(180 - 1e-3)
            .precision(.1);

    // Task 1
    } else if (worldType == WorldType.EQUIRECTANGULAR) {
        width = 600, height = 400;
        rotatable = false;
        attribute = "#world-equirectangular";
        projection = d3.geo.equirectangular()
            .scale(130)
            .translate([(width / 2) - 25, (height / 2) + 60])
            .precision(.1);
    } else if (worldType == WorldType.EUROPE) {
        width = 500, height = 500;
        rotatable = false;
        attribute = "#europe";
	    projection = d3.geo.equirectangular()
	        .scale(800)
	        .translate([width/2, height/2])
	        .rotate([-8, -52])
            .precision(.1);
    } else {
        console.log("@World: Invalid WorldType");
    }

    this.svg = d3.select(attribute).append("svg")
        .attr("width", width)
        .attr("height", height);

    this.path = d3.geo.path().projection(projection);

    // Define groups to enforce drawing order
    var g = this.svg.append("g");
    var graticulateGroup = g.append('g');
    var countryGroup = g.append('g');
    var arcGroup = g.append('g');

    ////
    //// Globe lines (graticule)
    ////

    graticulateGroup.append("defs").append("path")
        .datum({type: "Sphere"})
        .attr("id", "sphere")
        .attr("d", this.path);

    graticulateGroup.append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#sphere");

    graticulateGroup.append("use")
        .attr("class", "fill")
        .attr("xlink:href", "#sphere");

    var graticule = d3.geo.graticule();
    graticulateGroup.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", this.path);

    d3.select(self.frameElement).style("height", height + "px");

    ////
    //// Countries
    ////

    // Assign country names
    var countries = topojson.feature(world, world.objects.countries).features;
    countries.forEach(function(d) { 
        var tryit = names.filter(function(n) { return d.id == n.id; })[0];
        if (typeof tryit === "undefined"){
          d.name = "Undefined";
        } else {
          d.name = tryit.name; 
        }
    });
    
    // Displays country name on the map
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");
    
    // Assign country data, with key = id
    this.country = countryGroup.selectAll(".country").data(countries, function(d) {
        return d.id;
    });
    // Country selection
    this.country
        .enter()
        .insert("path")
        .attr("d", this.path)
        .attr("class", "land")
        .on("click", function(d,i) {
            var p = d3.geo.centroid(countries[i]);
            var places = [
                [-103.57283669203011, 44.75581985576071],
                [103.45274688320029, 36.683485526723125]
            ];

            // Rotate & draw immigration flux only if we are in the distanceModule
            if (worldType == WorldType.EQUIDISTANT) {
                drawFlux(this.path, arcGroup, p, places);

                (function transition() {
                    d3.transition().duration(750).tween("rotate", function() {
                        var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
                        return function(t) {
                            projection.rotate(r(t));
                            self.selectCountryByID(d.id);
                        };
                    });
                })();
            }
            // However, we always want the selected country to change appearance
            else {
                self.selectCountryByID(d.id);
            }
        })
        // Show tooltip
        .on("mousemove", function(d,i) {
            tooltip
                .classed("hidden", false)
                .attr("style", "left:"
                    + (d3.event.pageX - 20) + "px;top:"
                    + (d3.event.pageY - 40) +"px")
                .html(d.name);
        })

        // Hide tooltip
        .on("mouseout",  function(d,i) {
            tooltip.classed("hidden", true)
        });
}

World.prototype.selectCountryByID = function(id) {
    this.svg.selectAll("path")
        .attr("d", this.path)
        .classed("land-selected", function(d, i) {
            return d.id == id;
        });
};

World.prototype.selectCountryByName = function(countryName) {
    this.svg.selectAll("path")
        .attr("d", this.path)
        .classed("land-selected", countryName === "" ? false : function(d, i) {
            return d.name === countryName;
        });
};

World.prototype.fillCountriesByApplicants = function(data) {
    // Interpolate colors (between normal country fill and bar chart rect)
    var length = data.length;
    var colors = d3.scale.linear()
        .domain([data[length - 1].applicants, data[0].applicants])
        .interpolate(d3.interpolateRgb)
        .range([d3.rgb("#ededed"), d3.rgb("#2c3e50")]);

    // Add color to countries
    this.country
        .attr("d", this.path)
        .attr("class", "land")
        .style({fill: function(d) {
            var i;
            for (i = 0; i < length; i++) {
                if (d.name === data[i].country) {
                    return colors(data[i].applicants);
                }
            }
            return "#fff";
        }});
};

function drawFlux(path, arcGroup, origin, places) {
    var links = [];
    for (var i=0; i<2; i++) {
        links.push({
            type: "LineString",
            coordinates: [
                origin,
                places[i]
            ]
        });
    }

    var pathArcs = arcGroup.selectAll(".arc").data(links);

    //enter
    pathArcs.enter()
        .append("path").attr({
            'class': 'arc'
        }).style({ 
            fill: 'none',
        });

    //update
    pathArcs.attr({
            //d is the points attribute for this path, we'll draw
            //  an arc between the points using the arc function
            d: path
        })
        .style({
            stroke: '#0000ff',
            'stroke-width': '2px'
        })

    //exit
    pathArcs.exit().remove();
}
