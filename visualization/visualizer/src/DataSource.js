import { Component } from 'react';
import PropTypes from 'prop-types';
import { Observable } from 'rxjs';

export default class DataSource extends Component {
  static propTypes = {
    children: PropTypes.func,
  };

  constructor (props) {
    super(props);

    this.observable = null;
    this.state = {
      data: null,
      error: null,
      done: false,
    };
  }

  componentWillMount () {
    // connect ws
    this.observable = Observable.webSocket('ws://006262f2.ngrok.io');
    console.log('created observable');

    this.observable = this.observable
      .map(function (value) { return Observable.just(value).delay(500); })
      .concatAll();

    this.observable.subscribe(
      msg => {
        console.log('msg', msg);
        this.setState({ data: msg });
      },
      error => {
        console.error(error);
        this.setState({ data: null, error })
      },
      () => {
        console.log('observable done');
        this.setState({ data: null, error: null, done: true })
      }
    );
  }

  componentWillUnmount () {
    // disconnect
    // todo: close observable
  }


  render() {
    const { children } = this.props;

    const props = {
      data: this.state.data,
    };

    return children(props);
  }
}