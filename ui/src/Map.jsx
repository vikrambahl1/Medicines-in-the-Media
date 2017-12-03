import React from 'react';
import axios from 'axios';
import _ from 'lodash';
import ReactDOM from 'react-dom';
import topojson from 'topojson';
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import withRedux from "next-redux-wrapper";
import {
  Tooltip,
  actions,
} from "redux-tooltip";
import { initStore } from "../store"

const colorRange = ['#f7fcf0','#e0f3db','#ccebc5','#a8ddb5','#7bccc4','#4eb3d3','#2b8cbe','#0868ac','#084081'];
const baseColorScale = scaleLinear()
  .domain([0,1,2,3,4,5,6,7,8])
  .range(colorRange)

const wrapperStyles = {
  width: "100%",
  maxWidth: 100,
  margin: "0 auto"
}

const { show, hide } = actions

// https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
const numberWithCommas = (x) => {
  return (x || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url : props.medicaidView ? "./data/us-albers.json" : "./data/us-albers-counties.json",
      height : props.height,
      width : props.width,
      zoom: 1,
      medicaidView : props.medicaidView,
      geoData : {},
      selectedDrug : {},
      selectedYear : 0,
      colorScale : baseColorScale
    };

    this.handleZoomIn = this.handleZoomIn.bind(this)
    this.handleZoomOut = this.handleZoomOut.bind(this)
    this.loadCounts = this.loadCounts.bind(this)
    this.mapColors = this.mapColors.bind(this)
    this.loadInitData = this.loadInitData.bind(this)
    this.filterResults = this.filterResults.bind(this)
    this.handleMove = this.handleMove.bind(this)
    this.handleLeave = this.handleLeave.bind(this)
  }

  handleMove(geography, evt) {
    const x = evt.clientX / 2
    const y = evt.clientY - 150
    this.props.dispatch(
      show({
        origin: { x, y },
        content: geography.properties.name + ": " + numberWithCommas(this.state.geoData[geography.properties.iso_3166_2])
      })
    )
  }
  handleLeave() {
    this.props.dispatch(hide())
  }

  filterResults(response, selectedYear) {
    let geoData = {};
    let ranges = new Array(9);
    let max = 0;
    (response.data).forEach((d) => {
        // 	"state": "CO",
        // "quarter": 2,
        //"prescriptions": 423,
        // "year": 2010
        let count = d.prescriptions ? +d.prescriptions : 0
        if (+selectedYear === 0 || +d.year === +selectedYear) {
          if (!geoData[d.state]) {
            geoData[d.state] = 0;
          }
          geoData[d.state] = (geoData[d.state] + count);
        }

    });

    (Object.keys(geoData)).forEach((k) => {
      if (geoData[k] > max) {
        max = geoData[k];
      }
    });

    ranges[0] = 0;
    ranges[1] = Math.round(max * 0.125);
    ranges[2] = Math.round(max * 0.25);
    ranges[3] = Math.round(max * 0.375);
    ranges[4] = Math.round(max * 0.5);
    ranges[5] = Math.round(max * 0.625);
    ranges[6] = Math.round(max * 0.75);
    ranges[7] = Math.round(max * 0.875);
    ranges[8] = max;

    const colorScale = scaleLinear()
      .domain(ranges)
      .range(colorRange)
    this.setState({
      geoData : geoData,
      colorScale : colorScale
    });
  }

  loadInitData() {
    axios.get("./data/allstates_allyears.json")
      .then((response) => {
        if (response.data) {
          this.filterResults(response, this.state.selectedYear || 0)
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  componentDidMount() {
    this.loadInitData();
  }

  handleZoomIn() {
    this.setState({
      zoom: this.state.zoom * 1.5,
    })
  }
  handleZoomOut() {
    this.setState({
      zoom: this.state.zoom / 1.5,
    })
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.height !== this.state.height || nextProps.width !== this.state.width) {
      this.setState({
        height: nextProps.height,
        width : nextProps.width
      });
    }
    if (nextProps.medicaidView !== this.state.medicaidView) {
      this.setState({
        medicaidView : nextProps.medicaidView,
        url : nextProps.medicaidView ? "./data/us-albers.json" : "./data/us-albers-counties.json"
      });
    }

    if ((nextProps.selectedDrug && !_.isEmpty(nextProps.selectedDrug.concept_name)
        && nextProps.selectedDrug.concept_name !== this.state.selectedDrug.concept_name)
        || nextProps.selectedYear !== this.state.selectedYear) {
      this.setState({
        selectedDrug : nextProps.selectedDrug,
        selectedYear : nextProps.selectedYear
      }, () => {
        this.loadCounts();
      });
    }

    if (_.isEmpty(nextProps.selectedDrug.concept_name)) {
      this.loadInitData();
    }
  }

  loadCounts() {
    axios.get("http://tjg.pub/api/countsBreakdown/" + this.state.selectedDrug.concept_name + "/")
      .then((response) => {
          this.filterResults(response, this.state.selectedYear)
      })
      .catch((error) => {
        this.setState({ drugCounts : [] });
        console.log(error);
      });
  }

  mapColors(geography) {
    let val = 0;
    try {
      const geoState = geography.properties.iso_3166_2;
      val = this.state.geoData[geoState];

    } catch (err) {
      console.log(err);
    }
    return val || 0;
  }

  render() {
    return (
      <div className="map-frame">
        <div>
          <i onClick={this.handleZoomIn} className="fa fa-search-plus"></i>
          <i onClick={this.handleZoomOut} className="fa fa-search-minus"></i>
        </div>
        <div>
          <h5 style={{color:"gray", textAlign: "center"}}>{
            +this.state.selectedYear === 0 ? "All Years - Medicaid" : this.state.selectedYear + " - Medicaid"
          }</h5>
        </div>
        { _.isEmpty(this.state.geoData) ? <div style={{width:"100%", textAlign: "center", paddingTop: "20%"}}><h3 style={{color: "black"}}>No matching results</h3></div> :
        <div>
          <ComposableMap
            projectionConfig={{ scale: 1400 }}
             width={this.state.width}
             height={this.state.height}
             style={{
               width: "100%",
               height: "auto",
             }}>
             <ZoomableGroup center={[270,35]} zoom={this.state.zoom}>
               <Geographies geographyUrl={ this.state.url } disableOptimization>
                 {(geographies, projection) => geographies.map((geography, i) => (
                   <Geography
                     key={ i }
                     geography={ geography }
                     projection={ projection }
                     onMouseMove={this.handleMove}
                     onMouseLeave={this.handleLeave}
                     style={{
                       default: {
                         fill: this.state.colorScale(this.mapColors(geography)),
                         stroke: "#666",
                         strokeWidth: 0.5,
                         outline: "none",
                       },
                       hover: {
                         fill: this.state.colorScale(this.mapColors(geography)),
                         stroke: "white",
                         strokeWidth: 3,
                         outline: "none",
                       },
                       pressed: {
                         fill: "#263238",
                         stroke: "#607D8B",
                         strokeWidth: 0.75,
                         outline: "none",
                       }
                     }}
                   />
                 ))}
               </Geographies>
             </ZoomableGroup>
           </ComposableMap>
            <Tooltip />
            </div>
          }
        </div>


    );
  };
}

export default withRedux(initStore) (Map);
