import App from './src/App';

const RootComponent = App && App.default ? App.default : App;

export default RootComponent;
