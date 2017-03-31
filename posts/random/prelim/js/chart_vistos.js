var margin = {
        top: 50,
        right: 80,
        bottom: 100,
        left: 47
    },
    width = 650,
    height = .8 * width,
    aspect = width / height;
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
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
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
                if (d.key === 'Média RIC') return '.1'
            })
            .attr("id", 'tag' + d.key.replace(/\s+/g, '')) // aplicar classe das linhas
            .attr("d", valueline(d.values))
            .append("title");

        // legenda retangular
        //svg.append("rect")
        //.attr("x", height)
        //.attr("class", "legend")
        //.attr("y", -18)
        //.attr("width", 8)
        //.attr("height", 8)
        //.style("fill", function() { return d.color = color(d.key); });

        //linhas para anos
        //svg.selectAll("line").data(data).enter().append("line")       
        //.attr('x1',function(d) { return x(d.date); })
        //.attr('y1',function(d) { return y(0); })
        //.attr('x2',function(d) { return x(d.date); })
        //.attr('y2',function(d) { return y(d.value); })
        //.style("stroke-width", 2)
        //.style("stroke", "gray")
        //.style("stroke-dasharray", ("2, 2"))
        //.style("opacity",0);

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
            .attr("x", (legendSpace / 12) + i * legendSpace) // space legend
            .attr("y", -42)
            .attr("rx", 8)
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
                    .style("opacity", .5);
            })
            .on("click", function () {
                // Determine if current line is visible 
                var active = d.active ? false : true,
                    newOpacity = active ? 1 : 0.2;
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
                    .style("opacity", .2);
            })
            .on("click", function () {
                // Determine if current line is visible 
                var active = d.active ? false : true,
                    newOpacity = active ? 1 : 0.2;
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
        //.attr("y", 0 - margin.left)
        //.attr("x",0 - (height / 2))
        .attr("transform", "rotate(0)")
        .attr("y", height + 70)
        .attr("x", 120)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "#bbb")
        .text("Fonte: Departamendo de Estado dos EUA");

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