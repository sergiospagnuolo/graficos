var margin = {
  top: 20,
  right: 0,
  bottom: 30,
  left: 55
},
  width = 500 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var xValue = function(d) {
  return d.diretores;
},
  xScale = d3.scale.linear().range([0, width]),
  xMap = function(d) {
    return xScale(xValue(d));
  },
  xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(10);

var yValue = function(d) {
  return d.prop;
},
  yScale = d3.scale.linear().range([height, 0]),
  yMap = function(d) {
    return yScale(yValue(d));
  },
  yAxis = d3.svg.axis()
  .scale(yScale)
  .orient("left")
  .tickFormat(d3.format("%"))
  .ticks(5);

// cores
var cValue = function(d) {
  return d.mulher;
},
  color = d3.scale.category10().range(["rgb(94,153,171)","rgb(171,112,128)"]);

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("viewBox", "0 0 600 400")
  .append("g")
  .style("font", ".7em Merriweather sans")
  .style("font-weight", "300")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// tooltip
var tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

//  data
d3.csv(
  "https://raw.githubusercontent.com/voltdatalab/dados/master/direitos-humanos/generomo_numero/sodiretoria.csv",
  function(error, data) {
    // csv para numero
    data.forEach(function(d) {
      d.diretores = +d.diretores;
      d.mulheres = +d.mulheres;
      d.prop = +d.prop;
      //    console.log(d);
    });

    xScale.domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1]);
    yScale.domain([d3.min(data, yValue) - 0.1, d3.max(data, yValue) + 0]);

    
    // x-axis
    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .style("font-weight", "300")
      .style("font", ".8em Merriweather sans")
      .text("Diretorias");

    // y-axis
    svg
      .append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .attr("x", -10)
      .style("text-anchor", "end")
      .style("font", ".8em Merriweather sans")
      .style("font-weight", "300")
      .text("% de mulheres");

    // dots
    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 4.5)
      .style("opacity", 0.8)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) {
        return color(cValue(d));
      })
      .on("mouseover", function(d) {
        tooltip
          .transition()
          .duration(50)
          .attr("min-height", "60px")
          .style("opacity", 1)
          .style("background-color", "#cbcbcb")
          //.style("font", ".8em Merriweather sans")
          .style("padding", "10px");

        tooltip
          .html(
            "Empresa:<strong> " +
              d.nome +
              "</strong>" +
              "<br/>Diretorias apuradas: " +
              xValue(d) +
              "</strong> <br/>" +
              "Mulheres diretoras: "+ 
              d.mulheres+ "</strong> <br/>" +
              "Proporção de mulheres: <strong> " +
              yValue(d) * 100 +
              "%</strong>"
          )
          .style("left", d3.event.pageX + 5 + "px")
          .style("top", d3.event.pageY - 28 + "px")
          .style("bottom", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", function(d) {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    //  legenda
    var legend = svg
      .selectAll(".legend")
      .data(color.domain())
      .enter()
      .append("g")
      .attr("class", "legend")
      .style("font", ".8em 'Merriweather sans'")
      .attr("transform", function(d, i) {
        return "translate(0," + i * 20 + ")";
      });

    // legenda retangular
    legend
      .append("rect")
      .attr("x", width / 1.05)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

    // texto legenda
    legend
      .append("text")
      .attr("x", width / 1.07)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("font", "1em Merriweather sans")
      .style("font-weight", "300")
      .style("text-anchor", "end")
      .text(function(d) {
        return d;
      });
  }
);