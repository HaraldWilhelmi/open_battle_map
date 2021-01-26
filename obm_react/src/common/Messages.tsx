import {useSelector} from 'react-redux';
import {MessageCategory} from '../redux/Types';
import {RootState} from '../redux/Types';
import './Messages.css';


function cssForCategory(category: MessageCategory) {
    switch(category) {
        case MessageCategory.Success: { return 'success-message'; }
        default: { return 'error-message'; }
    }
}

const Messages = () => {
    let items = useSelector((state: RootState) => state.messages);
    let messages = items.map(
        (item, index) => (
            <div className={cssForCategory(item.category)} key={index}>
                {item.content}
            </div>
        )
    );
    return (<div className="message-box">{messages}</div>);
}

export default Messages;