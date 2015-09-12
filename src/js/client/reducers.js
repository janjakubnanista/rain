import * as A from './actions';
import * as C from './constants';

export function main(state = C.STATE_DEBUG_PLAYING, action) {
    switch (action.type) {
    case A.SELECT_LOCATION:
        return Object.assign({}, state, {
            gameState: C.GAMESTATE_PLAYING
        });

    default:
        return state;
    }
}
