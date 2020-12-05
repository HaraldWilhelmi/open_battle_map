import {useSelector} from 'react-redux';
import {MessageCategory} from '../redux/Messages';
import {RootState} from '../redux/Types';
import './Messages.css';

interface Props {}

function cssForCategory(category: MessageCategory) {
    switch(category) {
        case MessageCategory.Success: { return 'SuccessMessage'; }
        default: { return 'ErrorMessage'; }
    }
}

const Messages = (props: Props) => {
    let items = useSelector((state: RootState) => state.messages);
    let messages = items.map(
        (item) => (
            <div className={cssForCategory(item.category)}>
                {item.content}
            </div>
        )
    );
    return (<div>{messages}</div>);
}

export default Messages;