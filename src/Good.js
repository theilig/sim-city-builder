function Good(props) {
    return (<button onClick={() => props.goodWasClicked(props.name)}>{props.name + props.count}</button>)
}

export default Good;
