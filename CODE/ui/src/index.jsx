import React from 'react';
import {render} from 'react-dom';
import _ from 'lodash';
import axios from 'axios';

import Autocomplete from './Autocomplete.jsx';
import Detail from './Detail.jsx';
import Map from './Map.jsx';
import Timeline from './Timeline.jsx';
import Summary from './Summary.jsx';

import ReactModal from 'react-modal';
import Sidebar from 'react-sidebar';

const mql = window.matchMedia(`(min-width: 1200px)`);
const validParams = ['name', 'drug', 'medication', 'medicine', 'm', 'n', 'd', 'q']
const drugMap = {}

function getUrlParam(p) {
  return decodeURIComponent((new RegExp('[?|&]' + p + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDrug: {},
      guardianArticles : [],
      selectedYear : 0,
      mapHeight : 700,
      mapWidth : 1200,
      mql: mql,
      sidebarOpen: false,
      sidebarDocked : false,
      medicaidView : true,
      resetYear : false,
      drugCounts : [],
      eventData : [],
      aeData : [],
      adrData : []
    };

    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
    this.selectDrug = this.selectDrug.bind(this);
    this.selectYear = this.selectYear.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.loadDrugDetails = this.loadDrugDetails.bind(this);
    this.reset = this.reset.bind(this);
  }

  reset() {
    this.setState({
      selectedYear: 0,
      resetYear : true,
      selectedDrug : {}
    })
  };

  mediaQueryChanged() {
    this.setState({sidebarDocked: this.state.mql.matches});
  }

  onSetSidebarOpen(open) {
    this.setState({sidebarOpen: open});
  }

  componentWillMount() {
      this.updateDimensions();
      mql.addListener(this.mediaQueryChanged);
      this.setState({mql: mql, sidebarDocked: mql.matches});
  };

  componentDidMount() {
    //window.addEventListener("resize", this.updateDimensions);
    axios.get('./data/static_drug_lookup.json')
      .then((response) => {
        response.data.forEach(d => {
          drugMap[d.concept_name.toLowerCase()] = d;
        });

        axios.get('./data/brand_lookup.json')
          .then((response) => {
            response.data.forEach(d => {
              drugMap[d.concept_name.toLowerCase()] = d;
            });

            let matched = false;
            validParams.forEach(p => {
              if (!matched) {
                const val = getUrlParam(p);
                if (!_.isEmpty(val)) {
                  matched = true;
                  // todo should lookup concept code
                  if (drugMap[val.toLowerCase()]) {
                    this.selectDrug(drugMap[val.toLowerCase()])
                  } else {
                    this.selectDrug({ concept_name : _.capitalize(val) });
                  }
                }
              }
            });
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });

  };

  componentWillUnmount() {
      this.state.mql.removeListener(this.mediaQueryChanged);
      //window.removeEventListener("resize", this.updateDimensions);
  };

  updateDimensions() {
    const div = document.getElementById('main-container');
    if (div) {
        const height = div.clientHeight - 100;
        const width = +div.clientWidth + 200;
        console.log(width + ' x ' + height);
        this.setState({ mapHeight : height, mapWidth : width });
    }
  };

  handleOpenModal () {
    this.setState({ showModal: true });
  };

  handleCloseModal () {
    this.setState({ showModal: false });
  };


  selectDrug(drug) {
    console.log(drug);
    this.setState({
      selectedDrug : drug,
      drugCounts : [],
      eventData : [],
      aeData : [],
      adrData : []
    }, () => { this.loadDrugDetails(drug) });
  };

  loadDrugDetails(drug) {
    //axios.get("./data/countsByDrug.json")
    axios.get("http://tjg.pub/api/counts/" + drug.concept_name + "/")
      .then((response) => {
          //console.log(response.data);
          this.setState({ drugCounts : response.data });
      })
      .catch((error) => {
        this.setState({ drugCounts : [] });
        console.log(error);
      });
      axios.get("http://tjg.pub/api/events/" + drug.concept_name + "/")
        .then((response) => {
            //console.log(response.data);
            this.setState({ eventData : response.data });
        })
        .catch((error) => {
          this.setState({ eventData : [] });
          console.log(error);
        });
      axios.get("http://tjg.pub/api/faers/" + drug.concept_name + "/")
        .then((response) => {
            //console.log(response.data);
            this.setState({ aeData : response.data });
        })
        .catch((error) => {
          this.setState({ aeData : [] });
          console.log(error);
        });
      axios.get("http://tjg.pub/api/adr/" + drug.concept_name + "/")
        .then((response) => {
            //console.log(response.data);
            this.setState({ adrData : response.data });
        })
        .catch((error) => {
          this.setState({ adrData : [] });
          console.log(error);
        });
  }

  selectYear(year) {
    console.log(year);
    this.setState({
      selectedYear : year,
      resetYear : false
    });
  }

  render () {
    let sidebarContent = <div style={{padding:"5px"}}>
        <Detail  eventData={this.state.eventData}
                adrData={this.state.adrData}
                medicaidView={this.state.medicaidView}
                selectedDrug={this.state.selectedDrug}
                selectedYear={this.state.selectedYear}/>
        </div>;
    return (
      <div>
        <Sidebar sidebar={sidebarContent}
                 docked={this.state.sidebarDocked}
                 open={this.state.sidebarOpen}
                 onSetOpen={this.onSetSidebarOpen}
                 sidebarClassName="sidebar-class"
                 pullRight={false}>
          <nav className="navbar navbar-dark navbar-expand-lg bg-primary navbar-fixed-top">
            <div className="container-fluid">
              <div className="navbar-header">
                <a className="navbar-brand" style={{cursor: "default", color: "#1F9BCF"}}>Medicines in the Media</a>
              </div>
              <div id="navbar" className="collapse navbar-collapse">
                <ul className="nav navbar-nav" style={{width:"100%"}}>
                  <li><a className="a-header" onClick={this.handleOpenModal}>About</a></li>
                </ul>
                <div className="form-inline my-2 my-lg-0">
                  <Autocomplete className="form-control pull-right"
                    selectDrug={this.selectDrug}
                    selectedYear={this.state.selectedYear}/>
                </div>
              </div>
            </div>
          </nav>
            <div className="container-fluid" id="main-container" style={{marginTop: "10px", overflowX: "hidden"}}>
              <div className="row">
                  <div className="col-xs-12 col-md-9" id="map-div" style={{height:"100%", width:"100%"}}>
                  <Map
                    height={this.state.mapHeight}
                    width={this.state.mapWidth}
                    selectedDrug={this.state.selectedDrug}
                    selectedYear={this.state.selectedYear}
                    medicaidView={this.state.medicaidView}/>
                </div>
                <div className="col-xs-12 col-md-3" style={{padding:"0"}}>
                  <Summary
                    eventData={this.state.eventData}
                    aeData={this.state.aeData}
                    drugCounts={this.state.drugCounts}
                    selectedDrug={this.state.selectedDrug}
                    selectedYear={this.state.selectedYear}
                    resetYear={this.state.resetYear}
                    medicaidView={this.state.medicaidView}/>
                </div>
              </div>
              <div className="custom-footer row">
                <Timeline
                  eventData={this.state.eventData}
                  aeData={this.state.aeData}
                  medicaidView={this.state.medicaidView}
                  width={this.state.mapWidth}
                  selectedDrug={this.state.selectedDrug}
                  selectYear={this.selectYear}/>
              </div>

            </div>
            <br/>
            <ReactModal
               isOpen={this.state.showModal}
               contentLabel="About"
               shouldCloseOnOverlayClick={true}
               style={{
                  content: {
                    color: '#454545'
                  }
                }}>
              <i className="pull-right fa fa-times" style={{cursor: "pointer"}} onClick={this.handleCloseModal}></i>
              <h1 style={{color:"black"}}>About</h1>
              <p>
                <b>Medicines in the Media</b> is a project in <a target="_blank" href="http://poloclub.gatech.edu/cse6242/2017fall/">Polo Chau's CSE 6242 Data and Visual Analytics</a> course
                at the Georgia Institute of Technology.
                <br />
                Our team:
              </p>
              <ul>
                <li>Vikram Bahl</li>
                <li>Chris Baumann</li>
                <li>Trevor Goodyear</li>
                <li>Charity Hilton</li>
              </ul>
              <br/>
              <h4 style={{color:"black"}}>Acknowledgements</h4>
              <p>
                We would like to thank Jon Duke for project guidance. Thanks to Anne Cocos for her help mining
                Twitter data for adverse reactions.
                <br/>
                In addition, we acknowledge the following websites for providing data:
              </p>
              <ol>
                <li><a target="_blank" href="https://www.propublica.org">ProPublica</a></li>
                <li><a target="_blank" href="https://data.medicaid.gov">Data.Medicaid.gov</a></li>
                <li><a target="_blank" href="https://data.cms.gov/">Data.CMS.gov</a></li>
                <li><a target="_blank" href="https://www.ohdsi.org/">OHDSI</a></li>
                <li><a target="_blank" href="https://www.fda.gov/Drugs/GuidanceComplianceRegulatoryInformation/Surveillance/AdverseDrugEffects/ucm082193.htm">FDA Adverse Event Reporting System</a></li>
                <li>With additional media streams from <a target="_blank" href="http://open-platform.theguardian.com/">The Guardian</a>,
                  <a target="_blank" href="https://developer.nytimes.com/">The New York Times</a>, and <a target="_blank" href="https://developer.twitter.com/">Twitter</a>.
                </li>
              </ol>
              <h4 style={{color:"black"}}>References</h4>
              <ul>
                <li>Anne Cocos, Alexander G Fiks, Aaron J Masino; Deep learning for pharmacovigilance: recurrent neural network architectures for labeling adverse drug reactions in Twitter posts, Journal of the American Medical Informatics Association, Volume 24, Issue 4, 1 July 2017, Pages 813–821, <a target="_blank" href="https://doi.org/10.1093/jamia/ocw180">doi.org/10.1093/jamia/ocw180</a></li>
              </ul>
              <button className="btn btn-primary" style={{cursor: "pointer"}} onClick={this.handleCloseModal}>Close</button>
            </ReactModal>
      </Sidebar>
    </div>
  );}
}


render(<App/>, document.getElementById('app'));
