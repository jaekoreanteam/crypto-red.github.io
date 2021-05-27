import React from "react";
import { withStyles } from "@material-ui/core/styles";

import { green, red } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Fade from "@material-ui/core/Fade";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Collapse from "@material-ui/core/Collapse";

import api_crypto from "../utils/api-crypto";
import api from "../utils/api";
import actions from "../actions/utils";
import clipboard from "clipboard-polyfill";

const styles = theme => ({
    dialog: {
        [theme.breakpoints.down("sm")]: {
            "& .MuiDialog-container .MuiDialog-paper": {
                margin: "24px 0px",
                borderRadius: 0
            },
        }
    },
    breakAllWords: {
        wordBreak: "break-all"
    }
});


class CryptDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            classes: props.classes,
            open: props.open,
            logged_account: props.logged_account,
            _message_input: "",
            _is_message_input_error: false,
            _public_key_input: "",
            _is_public_key_input_error: false,
            _private_key_input: "",
            _is_private_key_input_error: false,
            _result_text: "",
            _is_result_dialog_open: false,
            _is_autofill_dialog_open: false,
            _view_name_index: 0,
        };
    };

    componentWillReceiveProps(nextProps, nextContext) {

        this.setState({...nextProps});
    }

    _handle_account_name_input_change = (event) => {

        this.setState({_account_name_input: event.target.value, _is_account_name_error: false});
    };

    _on_close = (event) => {

        setTimeout(() => {

            const state = {
                _message_input: "",
                _is_message_input_error: false,
                _public_key_input: "",
                _is_public_key_input_error: false,
                _private_key_input: "",
                _is_private_key_input_error: false,
                _result_text: "",
                _is_result_dialog_open: false,
                _is_autofill_dialog_open: false,
                _view_name_index: 0,
            };

            this.setState(state);

        }, 500);

        this.props.onClose(event);
    };

    _on_autofill_fields = (event) => {

        this.setState({_is_autofill_dialog_open: true});
    };

    _handle_autofill_dialog_close = (event) => {

        this.setState({_is_autofill_dialog_open: false});
    };

    _handle_result_text_result = (error, result) => {

        if(!error && result) {

            this.setState({_result_text: result});
            this.setState({_is_result_dialog_open: true});
        }else {

            actions.trigger_snackbar(error);
        }
    };

    _on_show_result = (event) => {

        const { _view_name_index } = this.state;
        const { _message_input, _public_key_input, _private_key_input } = this.state;

        const _is_message_input_error = !_message_input.length;
        const _is_public_key_input_error = !_public_key_input.length;
        const _is_private_key_input_error = !_private_key_input.length && _view_name_index === 1;

        if(!_is_message_input_error && !_is_public_key_input_error && !_is_private_key_input_error) {

            if(!_view_name_index) {

                api_crypto.nacl_encrypt(_message_input, _public_key_input, this._handle_result_text_result);

            }else {

                api_crypto.nacl_decrypt(_message_input, _public_key_input, _private_key_input, this._handle_result_text_result);
            }
        }

        this.setState({_is_message_input_error, _is_public_key_input_error, _is_private_key_input_error});

    };

    _handle_result_dialog_close = (event) => {

        this.setState({_is_result_dialog_open: false});

        setTimeout(() => {

            this.setState({_result_text: ""});

        }, 500);

    };

    _set_key_pair = (event, coin_id) => {

        const { logged_account, _view_name_index } = this.state;

        if(logged_account) {

            const _public_key_input = api.get_public_key_by_seed(coin_id, logged_account.seed);
            const _private_key_input = _view_name_index === 1 ? api.get_private_key_by_seed(coin_id, logged_account.seed): "";

            if(_view_name_index === 0) {

                actions.trigger_snackbar("Warning, do you want to send an encrypted message to yourself?");
            }

            this.setState({_public_key_input, _is_public_key_input_error: false, _private_key_input, _is_private_key_input_error: false, _is_autofill_dialog_open: false});
        }
    };

    _handle_view_name_change = (event, _view_name_index) => {

        this.setState({_view_name_index, _message_input: "", _is_message_input_error: false, _public_key_input: "", _is_public_key_input_error: false, _private_key_input: "", _is_private_key_input_error: false});
    };

    _handle_message_input_change = (event) => {

        this.setState({_message_input: event.target.value, _is_message_input_error: false});
    };

    _handle_public_key_input_change = (event) => {

        this.setState({_public_key_input: event.target.value, _is_public_key_input_error: false});
    };

    _handle_private_key_input_change = (event) => {

        this.setState({_private_key_input: event.target.value, _is_private_key_input_error: false});
    };

    _handle_result_text_copy = (event, text) => {

        if(text !== null || text !== "") {

            clipboard.writeText(text).then(
                function () {

                    actions.trigger_snackbar("Address successfully copied.");
                },
                function () {

                    actions.trigger_snackbar("Cannot copy this text.");
                }
            );
        }else {

            actions.trigger_snackbar("Cannot copy \"null\" text.");
        }
    };

    render() {

        const { classes, open, logged_account } = this.state;
        const { _message_input, _is_message_input_error, _public_key_input, _is_public_key_input_error, _private_key_input, _is_private_key_input_error } = this.state;
        const { _is_result_dialog_open, _is_autofill_dialog_open, _result_text } = this.state;
        const { _view_name_index } = this.state;

        return (
            <div>
                <Dialog
                    open={_is_result_dialog_open}
                    onClose={this._handle_result_dialog_close}
                    aria-labelledby="crypto-text-result-dialog-title"
                    aria-describedby="crypto-text-result-dialog-description"
                >
                    <DialogTitle id="crypto-text-result-dialog-title">{_view_name_index ? "Decrypt": "Encrypt"} text ({_result_text.length} length) result</DialogTitle>
                    <DialogContent>
                        <DialogContentText className={classes.breakAllWords} id="crypto-text-result-dialog-description">
                            {_result_text}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={(event) => {this._handle_result_text_copy(event, _result_text)}} color="primary">
                            copy
                        </Button>
                        <Button onClick={this._handle_result_dialog_close} variant="contained"  color="primary" autoFocus>
                            close
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    disableBackdropClick
                    disableEscapeKeyDown
                    maxWidth="xs"
                    open={_is_autofill_dialog_open}
                    onClose={this._handle_autofill_dialog_close}
                    aria-labelledby="crypto-text-autofill-dialog-title"
                    aria-describedby="crypto-text-autofill-dialog-description"
                >
                    <DialogTitle id="crypto-text-autofill-dialog-title">Autofill keys</DialogTitle>
                    <DialogContent divider>
                        <DialogContentText>
                            Select from which coin the public and private keys should be generated.
                        </DialogContentText>
                        <List component="nav" aria-label="Crypto keypair autofill list">
                            <ListItem button>
                                <ListItemText primary="v-systems" onClick={(event) => {this._set_key_pair(event, "v-systems")}}/>
                            </ListItem>
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this._handle_autofill_dialog_close} variant="contained"  color="primary" autoFocus>
                            close
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    className={classes.dialog}
                    open={open}
                    scroll={"paper"}
                    onClose={(event) => {this._on_close(event)}}
                    aria-labelledby="crypto-text-dialog-title"
                    aria-describedby="crypto-text-dialog-description"
                >
                    <DialogTitle id="crypto-text-dialog-title">{_view_name_index ? "Decrypt": "Encrypt"} text using NaCl</DialogTitle>
                    <Fade in>
                        <div>
                            <DialogContent>
                                <DialogContentText id="crypto-text-dialog-description">
                                    You have to provide either a public key to encrypt a message (Someone else public key) or both the public and private key (Your key pair) to decrypt the message.
                                </DialogContentText>
                            </DialogContent>
                            <Tabs
                                value={_view_name_index}
                                onChange={this._handle_view_name_change}
                                aria-label="Crypt tabs"
                                indicatorColor="primary"
                                variant="fullWidth"
                                selectionFollowsFocus
                            >
                                <Tab label="Encrypt" />
                                <Tab label="Decrypt" />
                            </Tabs>
                            <DialogContent>
                                <form noValidate autoComplete="off">
                                    <TextField
                                        onChange={this._handle_message_input_change}
                                        value={_message_input}
                                        error={_is_message_input_error}
                                        helperText={( _is_message_input_error) ? "Something is incorrect": ""}
                                        id="message"
                                        label="Message"
                                        type="text"
                                        fullWidth
                                    />
                                    <TextField
                                        onChange={this._handle_public_key_input_change}
                                        value={_public_key_input}
                                        error={_is_public_key_input_error}
                                        helperText={( _is_public_key_input_error) ? "Something is incorrect": ""}
                                        id="public-key"
                                        label="Public key"
                                        type="text"
                                        fullWidth
                                    />
                                    <Collapse in={_view_name_index === 1}>
                                        <TextField
                                            onChange={this._handle_private_key_input_change}
                                            value={_private_key_input}
                                            error={_is_private_key_input_error}
                                            helperText={( _is_private_key_input_error) ? "Something is incorrect": ""}
                                            id="private-key"
                                            label="Private key"
                                            type="password"
                                            fullWidth
                                        />
                                    </Collapse>
                                </form>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={(event) => {this._on_autofill_fields(event)}} color="primary" disabled={!logged_account}>
                                    autofill
                                </Button>
                                <Button onClick={(event) => {this._on_show_result(event)}} color="primary" disabled={_is_message_input_error || _is_public_key_input_error || _is_private_key_input_error}>
                                    show
                                </Button>
                                <Button onClick={(event) => {this._on_close(event)}} variant="contained"  color="primary" autoFocus>
                                    close
                                </Button>
                            </DialogActions>
                        </div>
                    </Fade>
                </Dialog>
            </div>
        );
    }
}

export default withStyles(styles)(CryptDialog);
