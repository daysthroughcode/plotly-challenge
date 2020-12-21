// Unpack JSON and Pop

function renderMetadata(sampleID) {
    d3.json("samples.json").then((data) => {
        console.log(data)
        const metadata = data.metadata;
        console.log(metadata)
        let resultsArray = metadata.filter(sampleobject => sampleobject.id == sampleID);
        let result = resultsArray[0]
        const dataPanel = d3.select("#sample-metadata");

        //clear existing data
        dataPanel.html("");
        //append
        Object.entries(result).forEach(([key, value]) => {
            dataPanel.append("h6").text(`${key}: ${value}`);
        });
    });
}

// CHARTS

function renderPlots(sampleID) {

    // Use `d3.json` to fetch the sample data for the plots
    d3.json("samples.json").then((data) => {
        //For bar and Bubble
        const samples = data.samples;
        let resultsarray = samples.filter(sampleobject => sampleobject.id == sampleID);
        let result = resultsarray[0]

        //set chart variables & lablel values
        let xValue = result.otu_ids;
        let labels = result.otu_labels;
        let yValue = result.sample_values;
        console.log(result)

        //For Gauge
        const metadata = data.metadata;
        let metaArray = metadata.filter(sampleobject => sampleobject.id == sampleID);

        //**Bonus** Render Gauge Chart
        // Set Level for Wash Frequency
        let level = (metaArray[0].wfreq * 20) - 10;

        // Calculate meter point
        let degrees = 180 - level,
            radius = .5;
        let radians = degrees * Math.PI / 180;
        let x = radius * Math.cos(radians);
        let y = radius * Math.sin(radians);

        // Render Pointer
        let mainPath = 'M -.0 -0.025 L .0 0.025 L ',
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
        let path = mainPath.concat(pathX, space, pathY, pathEnd);

        //Render Gauge
        let gaugeData = [{
            type: 'scatter',
            x: [0], y: [0],
            marker: { size: 28, color: '850000' },
            showlegend: false,
            name: 'Grot-o-meter',
            text: (level + 10) / 20,
            hoverinfo: 'text+name'
        },
        {
            values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
            rotation: 90,
            text: ['9', '8', '7', '6', '5', '4',
                '3', '2', '1'],
            textinfo: 'text',
            textposition: 'inside',
            marker: {
                colors: ['#35743D',
                    '#378241',
                    '#399144',
                    '#399A46',
                    '#A7B93A',
                    '#B6A83A',
                    '#B27B3A',
                    '#AF593A',
                    '#AC3A3D',
                    '#FFFFFF']
            },
            labels: ['', '9', '8', '7', '6', '5', '4', '3', '2', '1', '0'],
            hoverinfo: 'label',
            hole: .5,
            type: 'pie',
            showlegend: false
        }];

        const gaugeLayout = {
            shapes: [{
                type: 'path',
                path: path,
                fillcolor: '850000',
                line: {
                    color: '850000'
                }
            }],
            title: 'Scrubs by Frequency [Weekly]',
            height: 600,
            width: 600,
            xaxis: {
                zeroline: false, showticklabels: false,
                showgrid: false, range: [-1, 1]
            },
            yaxis: {
                zeroline: false, showticklabels: false,
                showgrid: false, range: [-1, 1]
            }
        };

        Plotly.newPlot('gauge', gaugeData, gaugeLayout);

        // Render Horizontal Bar Charts
        let dataBar = [{
            y: xValue.slice(0, 10).map(otuID => `OTU ${otuID}`).reverse(),
            x: yValue.slice(0, 10).reverse(),
            text: labels.slice(0, 10).reverse(),
            type: "bar",
            orientation: "h",
            marker: {
                colorscale: "Bluered",
                color: xValue,
            }
        }];

        const barLayout = {
            title: "Top 10 Bacteria Cultures by Mode",
            margin: { t: 30, l: 150 }
        };

        Plotly.newPlot("bar", dataBar, barLayout);

        // Render Bubble Chart
        let dataBubble = [
            {
                x: xValue,
                y: yValue,
                text: labels,
                mode: "markers",
                marker: {
                    colorscale: "Bluered",
                    color: xValue,
                    size: yValue,
                }
            }];

        const bubbleLayout = {
            xaxis: { title: "ID (Operational Taxonomic Unit) " },
            yaxis: { title: "Number of Colonies" }
        };

        Plotly.newPlot("bubble", dataBubble, bubbleLayout);

    });
}

function init() {
    // Select Dropdown
    let dropDown = d3.select("#selDataset");

    // Populate options using sample names
    d3.json("samples.json").then((data) => {
        let sampleNames = data.names;
        sampleNames.forEach((sampleID) => {
            dropDown
                .append("option")
                .text(sampleID)
                .property("value", sampleID);
        });

        //Set initial sample to render
        const firstSample = sampleNames[0];
        renderPlots(firstSample);
        renderMetadata(firstSample);
    });
}

function changeID(newID) {
    // Fetch new data each time a new sample is selected
    renderPlots(newID);
    renderMetadata(newID);
}

init();