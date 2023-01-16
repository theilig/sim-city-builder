import './App.css';
import GoodsList from "./GoodsList.js";
import ShoppingList from './ShoppingList';
import React, { useState } from 'react';

function App() {
  const [shoppingLists, setShoppingLists] = useState([])
  function addShoppingList(goodsNeeded) {
    var newShoppingLists = [...shoppingLists]
    newShoppingLists.push(goodsNeeded);
    setShoppingLists(newShoppingLists)
  }
  return (
    <div>
      <GoodsList addShoppingList={addShoppingList} />
      {shoppingLists.map((list, index) => <ShoppingList list={list} key={index} />)}
    </div>
  )
}

export default App;
