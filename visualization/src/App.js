import React, { Component } from 'react';
import './App.css';
import DataSource from './DataSource';
import Graph from 'react-graph-vis';

const options = {
  physics: {
    enabled: false,
  },
  height: '700px',
  nodes: {
    fixed: true,
    shape: 'dot',
    size: 5,
  }
};

class App extends Component {
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Solution Visualization</h1>
                </header>
                <DataSource>
                    {({ data }) =>
                        data ? (
                          <Graph
                            graph={{
                              nodes: data.nodes,
                              edges: data.edges,
                            }}
                            options={options}
                          />
                        ) : (
                            <div>no data</div>
                        )
                    }
                </DataSource>
            </div>
        );
    }
}

export default App;
