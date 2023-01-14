import logo from './logo.svg';
import './App.css';
import Good from "./Good.js";

function App() {
  var goods = {
    'metal': {},
    'wood': {},'plastic': {},'seeds': {},'mineral': {},'chemical': {},
    'toilet paper': {},
    'sugar&spices': {},'glass': {},'animal feed': {},'nails': {},
    'wood planks': {},
    'bricks': {},'cement': {},'glue': {},'paint': {},'hammer': {},
    'measuring tape': {},'shovel': {},
    'utensils': {},'ladder': {},'vegetables': {},'flour': {},'fruit': {},
    'cream': {},'chairs': {},
    'tables': {},'grass': {},'trees': {},'outdoor furniture': {},
    'reusable bags': {}
  };
  return (
    <div>
      {Object.keys(goods).map(good => (
        <Good name={good} />
      ))}
    </div>
  )
}

export default App;
