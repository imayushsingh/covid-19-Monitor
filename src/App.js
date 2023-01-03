import {Select, FormControl, MenuItem , Card , CardContent} from '@mui/material';
import { useEffect, useState } from 'react';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import {sortData , prettyPrintStat} from './util';
import numeral from "numeral";
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";

import './App.css';


function App() {
  const [country, setInputCountry] = useState("worldwide");
  const [countries, setCountries]=useState([]);
  const [countryInfo , setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);

  useEffect (()=>{
  fetch ("https://disease.sh/v3/covid-19/all")
  .then(response => response.json())
  .then(data => {
    setCountryInfo(data);
  })
  },[])

  //state=how to write a variable in REACT 
  //useEffect= runs a piece of code based on a given condition

useEffect(() => { 
  //async => send a request ,wait for it ,do something with info

  const getCountriesData = async () => {
    await fetch("https://disease.sh/v3/covid-19/countries")
    .then((response) => response.json())
    .then((data)  => { 
      const countries = data.map((country) => (
        {
          name: country.country, //United States , India
          value: country.countryInfo.iso2 //USA, IND
        }));


        let sortedData= sortData(data);
        setTableData(sortedData);  
      setCountries(countries);
      setMapCountries(data);
    }) ;
    };

    getCountriesData();
},[]);

console.log(casesType);

const onCountryChange = async (event) => {
  const countryCode = event.target.value;
  

const url= countryCode === "worldwide"
 ? "https://disease.sh/v3/covid-19/all"
 : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

 await fetch(url)
 .then(response => response.json())
 .then(data => { 
  setInputCountry(countryCode);
  setCountryInfo(data);
  setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
  setMapZoom(4);

 })
}



return (
  <div className="app">
    <div className="app__left">
      <div className="app__header">
        <h1>COVID-19 Tracker</h1>
        <FormControl className="app__dropdown">
          <Select
            variant="outlined"
            value={country}
            onChange={onCountryChange}
          >
            <MenuItem value="worldwide">Worldwide</MenuItem>
            {countries.map((country) => (
              <MenuItem value={country.value}>{country.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className="app__stats">
        <InfoBox
          onClick={(e) => setCasesType("cases")}
          title="Coronavirus Cases"
          isRed
          active={casesType === "cases"}
          cases={prettyPrintStat(countryInfo.todayCases)}
          total={numeral(countryInfo.cases).format("0.0a")}
        />
        <InfoBox
          onClick={(e) => setCasesType("recovered")}
          title="Recovered"
          active={casesType === "recovered"}
          cases={prettyPrintStat(countryInfo.todayRecovered)}
          total={numeral(countryInfo.recovered).format("0.0a")}
        />
        <InfoBox
          onClick={(e) => setCasesType("deaths")}
          title="Deaths"
          isRed
          active={casesType === "deaths"}
          cases={prettyPrintStat(countryInfo.todayDeaths)}
          total={numeral(countryInfo.deaths).format("0.0a")}
        />
      </div>
      <Map
        countries={mapCountries}
        casesType={casesType}
        center={mapCenter}
        zoom={mapZoom}
      />
    </div>
    <Card className="app__right">
      <CardContent>
        <div className="app__information">
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <h3>Worldwide new {casesType}</h3>
          <LineGraph casesType={casesType} />
        </div>
      </CardContent>
    </Card>
  </div>
);
};

export default App;