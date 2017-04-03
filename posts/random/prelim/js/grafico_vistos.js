var margin = {
        top: 50,
        right: 0,
        bottom: 0,
        left: 50
    },
    //width = parseInt(d3.select('#chart').style('width'), 10),
    //width = width - margin.left - margin.right,
    width = 700,
    height = 600;
    //aspect = width / height;
//width = 700 - margin.left - margin.right,
//height = 700 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y").parse;

// escalas
var x = d3.time.scale().range([0, width]);
//var y = d3.scale.log().range([height, 0]); Logaritmica, se necessário
var y = d3.scale.linear().range([height, 40]);

// eixos
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(7)
    .innerTickSize(-height)
    .outerTickSize(0)
    .tickPadding(10);

var yAxis = d3.svg.axis().scale(y)
    .orient("left")
    .ticks(6, "%")
    .tickSize(3, 0)
    .innerTickSize(-width)
    .outerTickSize(0)
    .tickPadding(15);

// linhas do gráfico
var valueline = d3.svg.line()
    .x(function (d) {
        return x(d.date);
    })
    // se usar escala log, cria o valor referência
    .y(function (d) {
        return y(d.value + 1);
    });

var nota = d3.select(".nota")
    .attr("class", "nota")
    .style("opacity", "0");

// acrescenta a canvas de svg
var svg = d3.select("#chart")
    .append("svg")
    //.attr("width", width + margin.left + margin.right)
    //.attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", "0 0 800 800")
    .attr("preserveAspectRatio", "xMaxYMid meet")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


// puxa os dados da tabela
d3.tsv("dados/reject.tsv", function (error, data) {
    data.forEach(function (d) {
        d.date = parseDate(d.date);
        d.value = +d.value;
    });


    // Scale the range of the data
    x.domain(d3.extent(data, function (d) {
        return d.date;
    }));
    y.domain([1, d3.max(data, function (d) {
        return d.value;
    })]);

    // Nest the entries by key
    var dataNest = d3.nest()
        .key(function (d) {
            return d.key;
        })
        .entries(data);


    var piaui = ["#7bad65", "#777", "#5ea4ab", "#eabf54", "#d94f30"]

    var color = d3.scale.ordinal()
        .range(piaui)

    legendSpace = width / dataNest.length; // espaçamento da legenda


    // utiliza as categorias
    dataNest.forEach(function (d, i) {

        svg.append("path")
            .attr("class", "line")
            .style("stroke", function () {
                return d.color = color(d.key);
            })
            //acrescenta linha dashed pra média
            .style('stroke-dasharray', function () {
                return d.key === 'Média RIC' ? '4 4' : '';
            })
            .style('opacity', function () {
                if (d.key === 'Rússia') return '.1';
                if (d.key === 'China') return '.1'
                if (d.key === 'Índia') return '.1'
                if (d.key === 'Média') return '.1'
            })
            .attr("id", 'tag' + d.key.replace(/\s+/g, '')) // aplicar classe das linhas
            .attr("d", valueline(d.values))
            .append("title");

        // Define a div para tooltip
        var div = d3.select("#chart").append("div")
            .data(data)
            .attr("class", "tooltip")
            .style("opacity", 0);


        // Formata data para tooltip
        var FormatDate = d3.time.format("%Y");

        // Acrescenta os pontos pra tooltip
        svg.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr("r", 5)
            .attr("cx", function (d) {
                return x(d.date);
            })
            .attr("cy", function (d) {
                return y(d.value + 1);
            })
            .style("fill", function (d) {
                return d.color = color(d.key);
            })
            .style("opacity", ".0")
            .attr("id", 'dot' + d.key.replace(/\s+/g, ''))
            .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 1);
                div.html("<h4>Ano: </h4>" + FormatDate(d.date) + "<br/>" + "<h4>Taxa de rejeição: </h4> " + d.value + "%<br/>" + "<hr/>" + "<h4>Total de vistos concedidos: </h4>" + d.vistos + "<br/>" + "<h4>Turismo/Negócios: </h4>" + d.v_pct + "<br/>" + "<h4>Trabalho/Estudos: </h4>" + d.t_pct + "<br/>" + "<h4>Outros tipos: </h4>" + d.o_pct)
                    .style("left", d3.select(this).attr("cx") + "px")
                    .style("top", d3.select(this).attr("cy") + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(1000)
                    .style("opacity", 0);
            });
        
        //rect botões
        svg.append("rect")
            .attr("x", (legendSpace / 5.3) + i * legendSpace) // space legend
            .attr("y", -47)
            .attr("rx", 5)
            .attr("class", "botoes")
            .style("fill", function () {
                return d.color = color(d.key);
            })
            .on("mouseover", function () {
                nota.transition()
                    .style("display", "block")
                    .style("opacity", "1");
            })
            .on("mouseout", function (d) {
                nota.transition()
                    .style("display", "none")
                    .style("opacity", "0");
            })
            .on("click", function () {
                // Determine if current line is visible 
                var active = d.active ? false : true,
                    newOpacity = active ? 1 : 0;
                // Hide or show the elements based on the ID
                d3.select("#tag" + d.key.replace(/\s+/g, ''))
                    .transition().duration(300)
                    .ease("linear")
                    .style("opacity", newOpacity);
                d.active = active;
            })
            .text(d.key);
            

        // texto legenda 
        svg.append("text")
            .attr("x", (legendSpace / 2) + i * legendSpace) // space legend
            //.attr("y", height + (margin.bottom/1.5)+ 5)
            .attr("y", -20)
            .attr("class", "legend")
            //.style("fill", function () {return d.color = color(d.key);})
            .style("fill", "#fff")
            .on("mouseover", function () {
                nota.transition()
                    .style("display", "block")
                    .style("opacity", "1");
            })
            .on("mouseout", function (d) {
                nota.transition()
                    .style("opacity", 0);
            })
            .on("click", function () {
                // Determine if current line is visible 
                var active = d.active ? false : true,
                    newOpacity = active ? 1 : 0;
                // Hide or show the elements based on the ID
                d3.select("#tag" + d.key.replace(/\s+/g, ''))
                    .transition().duration(300)
                    .ease("linear")
                    .style("opacity", newOpacity);
                d.active = active;
            })
            .text(d.key);

    });

    // eixo x
    svg.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(0," + height + ")")
        .style("stroke", "15px")
        .call(xAxis);

    // eixo y
    svg.append("g")
        .attr("class", "y_axis")
        .style("stroke", "0")
        .call(yAxis);

    // Fonte
    svg.append("text")
        .attr("transform", "rotate(0)")
        .attr("class", "fonte")
        .attr("y", height + 70)
        .attr("x", 74)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "#bbb")
        .text("Fonte: Depto. de Estado dos EUA");

    svg.append("rect")
        //.attr("x",0 - (height / 2))
        //.attr("y", 0 - margin.left)
        .attr("y", height + 60)
        .attr("x", -38)
        .attr("width", width - 50)
        .attr("height", "2px")
        .style("fill", "#bbbbbb");

    svg.append("svg:image")
        .attr("xlink:href", "piauicinza.png")
        .attr("y", height + 20)
        .attr("x", width - 60)
        .attr("width", 60)
        .attr("height", 80);


});

d3.select(window).on('resize', resize); 

function resize() {
    // update width
    width = parseInt(d3.select('#chart').style('width'), 10),
    width = width - margin.left - margin.right,
    
    
    legendSpace = width / dataNest.length;
    
    // reset x range
    x.range([0, width]);

    // do the actual resize...
    
    chart.selectAll('rect')
        .attr('width', width);
}