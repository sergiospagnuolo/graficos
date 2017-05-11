//baseado em http://bl.ocks.org/jhubley/17aa30fd98eb0cc7072f

function filterJSON(json, key, value) {
  var result = [];
  json.forEach(function(val, idx, arr) {
    if (val[key] == value) {
      result.push(val);
    }
  });
  return result;
}

// dimensões
var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 30
  },
  width = 700 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// ajusta formado de data
var parseDate = d3.time.format("%m-%d-%Y").parse;

var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// eixos
var xAxis = d3.svg.axis().scale(x)
.orient("bottom")
.ticks(5)
.innerTickSize(-height)
.outerTickSize(0);
//.tickFormat(d3.time.format("%m-%Y"));

var yAxis = d3.svg.axis().scale(y)
.orient("left")
.ticks(5)
.tickFormat(function(d) { return d + "%"; })
.innerTickSize(-width)
.tickValues(data)
.outerTickSize(0);

// linha
var stateline = d3.svg
.line()
.interpolate("monotone")
.x(function(d) {
  return x(d.date);
})
.y(function(d) {
  return y(d.value);
});

// canvas
var svg = d3
.select("#chart")
.append("svg")
.attr("viewBox", "0 0 700 500")
//.attr("width", width + margin.left + margin.right)
//.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var data;
// data
d3.json(
  "https://raw.githubusercontent.com/voltdatalab/dados/master/economia/ipca_habit_date",
  function(error, json) {
    console.log(json);

    json.forEach(function(d) {
      d.value = +d.value;
      d.date = parseDate(d.date);
    });

    d3.select("#inds").on("change", function() {
      var sect = document.getElementById("inds");
      var section = sect.options[sect.selectedIndex].value;

      data = filterJSON(json, "uf", section);

      //debugger

      data.forEach(function(d) {
        d.value = +d.value;
        //d.date = parseDate(d.date);
        d.active = true;
      });

      //debugger
      updateGraph(data);

      jQuery("h1.page-header").html(section);
    });

    // grafico inicial
    data = filterJSON(json, "uf", "bra");
    updateGraph(data);
  }
);

var color = d3.scale.ordinal().range(["#f0027f", "#386cb0"]);

function updateGraph(data) {
  // escala
  x.domain(
    d3.extent(data, function(d) {
      return d.date;
    })
  );
  y.domain([
    d3.min(data, function(d) {
      return -5;
    }),
    d3.max(data, function(d) {
      return 9;
    })
  ]);

  // Nest 
  dataNest = d3
    .nest()
    .key(function(d) {
    return d.tipo;
  })
    .entries(data);

  var result = dataNest.filter(function(val, idx, arr) {
    return $("." + val.key).attr("fill") != "#ccc";
    // matching the data with selector status
  });

  var state = svg.selectAll(".line").data(result, function(d) {
    return d.key;
  });

  state.enter().append("path").attr("class", "line");

  state
    .transition()
    .duration(2000)
    .style("stroke", function(d, i) {
    return (d.color = color(d.key));
  })
    .attr("id", function(d) {
    return "tag" + d.key.replace(/\s+/g, "");
  }) // assign ID
    .attr("d", function(d) {
    return stateline(d.values);
  });

  state.exit().remove();

  var legend = d3
  .select("#legend")
  .selectAll("text")
  .data(dataNest, function(d) {
    return d.key;
  });

  //checkboxes
  legend
    .enter()
    .append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("x", 0)
    .attr("y", function(d, i) {
    return 0 + i * 15;
  }) // espacamento
    .attr("fill", function(d) {
    return color(d.key);
  })
    .attr("class", function(d, i) {
    return "legendcheckbox " + d.key;
  })
    .on("click", function(d) {
    d.active = !d.active;

    d3.select(this).attr("fill", function(d) {
      if (d3.select(this).attr("fill") == "#ccc") {
        return color(d.key);
      } else {
        return "#ccc";
      }
    });

    var result = dataNest.filter(function(val, idx, arr) {
      return $("." + val.key).attr("fill") != "#ccc";
      // matching the data with selector status
    });

    // Hide or show the lines based on the ID
    svg
      .selectAll(".line")
      .data(result, function(d) {
      return d.key;
    })
      .enter()
      .append("path")
      .attr("class", "line")
      .style("stroke", function(d, i) {
      return (d.color = color(d.key));
    })
      .attr("d", function(d) {
      return stateline(d.values);
    });

    svg
      .selectAll(".line")
      .data(result, function(d) {
      return d.key;
    })
      .exit()
      .remove();
  });
  
  svg.append("g")
    .attr("class", "yAxis")
    .append("rect")
    .attr("x", 0)
    .attr("y", 289)
    .attr("height", 1)
    .attr("width", width);

  // Add the Legend text
  legend
    .enter()
    .append("text")
    .attr("x", 15)
    .attr("y", function(d, i) {
    return 10 + i * 15;
  })
    .attr("class", "legend");

  legend.transition().style("fill", "#222").text(function(d) {
    return d.key;
  });

  legend.exit().remove();

  svg.selectAll(".axis").remove();

  // Add the X Axis
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Add the Y Axis
  svg.append("g").attr("class", "y axis").call(yAxis);
}

function clearAll() {
  d3.selectAll(".line").transition().duration(100).attr("d", function(d) {
    return null;
  });
  d3
    .select("#legend")
    .selectAll("rect")
    .transition()
    .duration(100)
    .attr("fill", "#ccc");
}

function showAll() {
  d3.selectAll(".line").transition().duration(100).attr("d", function(d) {
    return stateline(d.values);
  });
  d3.select("#legend").selectAll("rect").attr("fill", function(d) {
    if (d.active == true) {
      return color(d.key);
    }
  });
}