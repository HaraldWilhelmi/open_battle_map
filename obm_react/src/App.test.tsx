import React from 'react';
import { render, screen } from '@testing-library/react';
import {Provider} from 'react-redux';
import App from './App';
import store from './redux/Store';

test('renders learn react link', () => {
    render(
        <Provider store={store}>
            <App />
        </Provider>
    );
    const linkElement = screen.getByText(/No such Map Set/i);
    expect(linkElement).toBeInTheDocument();
});
