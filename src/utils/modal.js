import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from 'store/configureStore';
import IntlWrapper from 'components_/IntlWrapper/IntlWrapper';

export const openModal = (Component, componentProps) => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  const modalProps = ({ visible, centered, close }) => ({
    visible,
    centered,
    close,
  });

  const render = props => {
    ReactDOM.render(
      <Provider store={store}>
        <IntlWrapper>
          <Component {...props} />
        </IntlWrapper>
      </Provider>,
      div,
    );
  };
  const destroy = () => {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  };
  const close = () => {
    setTimeout(() => {
      destroy();
    }, 500);
    render({ ...modalProps({ visible: false, close }) });
  };

  render({
    ...componentProps,
    ...modalProps({ visible: true, centered: true, close }),
  });
};

export const x = 5;
