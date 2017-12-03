import React from 'react';
import Autosuggest from 'react-autosuggest';
import axios from 'axios';
import _ from 'lodash';

let drugs = [];

function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSuggestions(value) {
  const escapedValue = escapeRegexCharacters(value.trim());

  if (escapedValue === '') {
    return [];
  }

  const regex = new RegExp('^' + escapedValue, 'i');

  return drugs.filter(drug => regex.test(drug.display_name));
}

function getSuggestionValue(suggestion) {
  return suggestion.concept_name;
}

function renderSuggestion(suggestion) {
  return (
    <span>
      {_.capitalize(suggestion.display_name)}
      { suggestion.popular_ingredient ?
        <span style={{color: "lightgrey", fontStyle: "italic", paddingLeft: "5px"}}> Popular</span> : <span/>
      }
    </span>
  );
}

class Autocomplete extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      suggestions: []
    };
    this.onChange = this.onChange.bind(this);
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
  }

componentDidMount() {

    let generic = [];
    axios.get('./data/static_drug_lookup.json')
      .then((response) => {
        generic = response.data.filter((d) => {
          const lc = d.concept_name.toLowerCase();
          // remove some weird ones
          return lc.indexOf('extract') < 0
            && lc.indexOf('venom') < 0
            && lc !== 'coal tar'
            && lc !== 'caffeine';
        });

        axios.get('./data/brand_lookup.json')
          .then((response) => {
            //console.log(response.data)
            drugs = generic.concat(response.data)
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
}


  onChange(event, { newValue, method }) {
    this.setState({
      value: newValue
    });
  };

  onSuggestionsFetchRequested ({ value }) {
    this.setState({
      suggestions: getSuggestions(value)
    });
  };

  onSuggestionsClearRequested() {
    this.setState({
      suggestions: []
    });
  };

  onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    this.props.selectDrug(suggestion);
  }


  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "Type medicine name (e.g. Aspirin)",
      value,
      onChange: this.onChange
    };

    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        onSuggestionSelected={this.onSuggestionSelected}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps} />
    );
  }
}

export default Autocomplete;
