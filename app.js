// Unpack JSON and Pop

function renderMetadata(sampleID) {
    d3.json("samples.json").then((data) => {
        console.log(data)
        const metadata = data.metadata;
        let resultsarray = metadata.filter(sampleobject => sampleobject.id == sampleID);
        let result = resultsarray[0]
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
        const samples = data.samples;
        let resultsarray = samples.filter(sampleobject => sampleobject.id == sampleID);
        let result = resultsarray[0]
        //set chart variables & lablel values
        let xValue = result.otu_ids;
        let labels = result.otu_labels;
        let yValue = result.sample_values;
        console.log(result)

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

        let barLayout = {
            title: "Top 10 Bacteria Cultures by Mode",
            margin: { t: 30, l: 150 }
        };

        Plotly.newPlot("bar", dataBar, barLayout);

        // Render Bubble Chart
        let bubbleLayout = {
            xaxis: { title: "ID (Operational Taxonomic Unit) " },
            yaxis: { title: "Number of Colonies" }
        };

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