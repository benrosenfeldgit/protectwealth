import React, {Component} from 'react';
import {withStyles, Button, Tab, Tabs, TextField, InputAdornment, Icon, IconButton, Typography, Avatar, Tooltip} from '@material-ui/core';
import {FuseAnimate, FusePageCarded, FuseChipSelect} from '@fuse';
import {orange} from '@material-ui/core/colors';
import {Link, withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import connect from 'react-redux/es/connect/connect';
import _ from '@lodash';
import withReducer from 'app/store/withReducer';
import * as Actions from '../store/actions';
import reducer from '../store/reducers';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import api from 'app/ApiConfig'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import GoogleMap from 'google-map-react';
import FeedbackTab from '../../profile/tabs/FeedbackTab';

function Marker({text})
{
    return (
        <Tooltip title={text} placement="top">
            <Icon className="text-red">place</Icon>
        </Tooltip>
    );
}

const CustomTableCell = withStyles(theme => ({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
}))(TableCell);
  
const styles = theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
        overflowX: 'auto',
    },
    table: {
        minWidth: 700,
    },
    row: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
    },
    eventImageFeaturedStar: {
        position: 'absolute',
        top     : 0,
        right   : 0,
        color   : orange[400],
        opacity : 0
    },
    eventImageItem        : {
        transitionProperty      : 'box-shadow',
        transitionDuration      : theme.transitions.duration.short,
        transitionTimingFunction: theme.transitions.easing.easeInOut,
        '&:hover'               : {
            boxShadow                    : theme.shadows[5],
            '& $eventImageFeaturedStar': {
                opacity: .8
            }
        },
        '&.featured'            : {
            pointerEvents                      : 'none',
            boxShadow                          : theme.shadows[3],
            '& $eventImageFeaturedStar'      : {
                opacity: 1
            },
            '&:hover $eventImageFeaturedStar': {
                opacity: 1
            }
        }
    }
});

class Event extends Component {

    state = {
        tabValue: 0,
        form    : null,
        basedata: null,
    };

    componentDidMount()
    {
        this.updateEventState();
        api.post('/base/getBasedata', {})
            .then(res => {
                this.setState({basedata: res.data.doc});
            });
    }

    componentDidUpdate(prevProps, prevState, snapshot)
    {
        if ( !_.isEqual(this.props.location, prevProps.location) )
        {
            this.updateEventState();
        }

        if (
            (this.props.event.data && !this.state.form) ||
            (this.props.event.data && this.state.form && this.props.event.data.id !== this.state.form.id)
        )
        {
            this.updateFormState();
        }
    }

    updateFormState = () => {
        this.setState({form: this.props.event.data})
    };

    updateEventState = () => {
        const params = this.props.match.params;
        const {eventId} = params;

        if ( eventId === 'new' )
        {
            this.props.newEvent();
        }
        else
        {
            this.props.getEvent(this.props.match.params);
        }
    };

    handleDeleteFriendOffer = (row) => {
        var {form} = this.state;
        var {friend_offer} = form;
        var res = [];
        friend_offer.map((cursor) => {
            if (cursor._id !== row._id)
                res.push(cursor);
            return null;
        });
        this.setState({form: _.set({...this.state.form}, 'friend_offer', res)});
    }

    handleDeleteFriendJoin = (row) => {
        var {form} = this.state;
        var {friend_join} = form;
        var res = [];
        friend_join.map((cursor) => {
            if (cursor._id !== row._id)
                res.push(cursor);
            return null;
        });
        this.setState({form: _.set({...this.state.form}, 'friend_join', res)});
    }

    handleChangeTab = (event, tabValue) => {
        this.setState({tabValue});
    };

    handleChange = (event) => {
        this.setState({form: _.set({...this.state.form}, event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value)});
    };

    handleChipChange = (value, name) => {
        this.setState({form: _.set({...this.state.form}, name, value.map(item => item.value))});
    };

    setFeaturedImage = (id) => {
        this.setState({form: _.set({...this.state.form}, 'featuredImageId', id)});
    };

    canBeSubmitted()
    {
        const {name} = this.state.form;
        return (
            name.length > 0 &&
            !_.isEqual(this.props.event.data, this.state.form)
        );
    }

    updateEmployerProfile = (form, is_update) => {
        if (is_update === true) {
            api.post('/profile/updatePostedEvent', {
                employer_email: form.employer_email,
                event_id: form._id,
                event_name: form.name,
                event_state: form.event_state,
                created_at: Date.now(),
            })
        }
        else {
            api.post('/profile/addPostedEvent', {
                employer_email: form.employer_email,
                event_id: form._id,
                event_name: form.name,
                event_state: form.event_state,
                created_at: Date.now(),
            })
        }
    }

    render()
    {
        const {classes, saveEvent, addEvent} = this.props;
        const {tabValue, form, basedata} = this.state;

        return (
            <FusePageCarded
                classes={{
                    toolbar: "p-0",
                    header : "min-h-72 h-72 sm:h-136 sm:min-h-136"
                }}
                header={
                    form && (
                        <div className="flex flex-1 w-full items-center justify-between">

                            <div className="flex flex-col items-start max-w-full">

                                <FuseAnimate animation="transition.slideRightIn" delay={300}>
                                    <Typography className="normal-case flex items-center sm:mb-12" component={Link} role="button" to="/events/events">
                                        <Icon className="mr-4 text-20">arrow_back</Icon>
                                        Events
                                    </Typography>
                                </FuseAnimate>

                                <div className="flex items-center max-w-full">
                                    {/* <FuseAnimate animation="transition.expandIn" delay={300}>
                                        {form.images.length > 0 ? (
                                            <img className="w-32 sm:w-48 mr-8 sm:mr-16 rounded" src={_.find(form.images, {id: form.featuredImageId}).url} alt={form.name}/>
                                        ) : (
                                            <img className="w-32 sm:w-48 mr-8 sm:mr-16 rounded" src="assets/images/ecommerce/product-image-placeholder.png" alt={form.name}/>
                                        )}
                                    </FuseAnimate> */}
                                    <div className="flex flex-col min-w-0">
                                        <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                                            <Typography className="text-16 sm:text-20 truncate">
                                                {form.name ? form.name : 'New Event'}
                                            </Typography>
                                        </FuseAnimate>
                                        <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                                            <Typography variant="caption">Event Detail</Typography>
                                        </FuseAnimate>
                                    </div>
                                </div>
                            </div>
                            <FuseAnimate animation="transition.slideRightIn" delay={300}>
                            <div>
                            {this.props.match.params.eventId !== 'new' &&
                                <Button
                                    className="whitespace-no-wrap"
                                    variant="contained"
                                    disabled={!this.canBeSubmitted()}
                                    onClick={() => {
                                        saveEvent(form);
                                        this.updateEmployerProfile(form, true);
                                    }}
                                >
                                    Save
                                </Button>
                            }
                            {this.props.match.params.eventId === 'new' &&
                                <Button
                                    className="whitespace-no-wrap"
                                    variant="contained"
                                    disabled={!this.canBeSubmitted()}
                                    onClick={() => {
                                        addEvent(form);
                                        this.updateEmployerProfile(form, false);
                                    }}
                                >
                                    Add
                                </Button>
                            }
                            </div>
                            </FuseAnimate>
                        </div>
                    )
                }
                contentToolbar={
                    <Tabs
                        value={tabValue}
                        onChange={this.handleChangeTab}
                        indicatorColor="secondary"
                        textColor="secondary"
                        variant="scrollable"
                        scrollButtons="auto"
                        classes={{root: "w-full h-64"}}
                    >
                        <Tab className="h-64 normal-case" label="Basic Info"/>
                        <Tab className="h-64 normal-case" label="Requirement"/>
                        <Tab className="h-64 normal-case" label="Friends"/>
                        <Tab className="h-64 normal-case" label="Location"/>
                        {form && form.event_state === 'Finished' &&
                            <Tab className="h-64 normal-case" label="Feedback"/>
                        }
                    </Tabs>
                }
                content={
                    form && (
                        <div className="p-16 sm:p-24 max-w-2xl">
                            {tabValue === 0 && 
                            (
                                <div>

                                    <div className="flex">
                                        <TextField
                                            className="mt-8 mb-16 mx-4"
                                            error={form.name === ''}
                                            required
                                            label="Name"
                                            id="employer_name"
                                            name="employer_name"
                                            value={form.employer_name}
                                            onChange={this.handleChange}
                                            variant="outlined"
                                            fullWidth
                                        />

                                        <TextField
                                            className="mt-8 mb-16 mx-4"
                                            label="Email"
                                            id="employer_email"
                                            name="employer_email"
                                            value={form.employer_email}
                                            onChange={this.handleChange}
                                            variant="outlined"
                                            fullWidth
                                        />
                                    </div>

                                    <TextField
                                        className="mt-8 mb-16"
                                        error={form.name === ''}
                                        required
                                        label="Name"
                                        autoFocus
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={this.handleChange}
                                        variant="outlined"
                                        fullWidth
                                    />

                                    <TextField
                                        className="mt-8 mb-16"
                                        id="description"
                                        name="description"
                                        onChange={this.handleChange}
                                        label="Description"
                                        type="text"
                                        value={form.description}
                                        multiline
                                        rows={5}
                                        variant="outlined"
                                        fullWidth
                                    />

                                    <FuseChipSelect
                                        className="mt-8 mb-24"
                                        value={
                                            form.category.map(item => ({
                                                value: item,
                                                label: item
                                            }))
                                        }
                                        onChange={(value) => this.handleChipChange(value, 'category')}
                                        placeholder="Select multiple categories"
                                        textFieldProps={{
                                            label          : 'Category',
                                            InputLabelProps: {
                                                shrink: true
                                            },
                                            variant        : 'outlined'
                                        }}
                                        options={basedata && basedata.categories.map(item => ({
                                            value: item,
                                            label: item,
                                        }))}
                                        isMulti
                                    />

                                    <FuseChipSelect
                                        className="mt-8 mb-16"
                                        value={
                                            form.type.map(item => ({
                                                value: item,
                                                label: item
                                            }))
                                        }
                                        onChange={(value) => this.handleChipChange(value, 'type')}
                                        placeholder="Select multiple tags"
                                        textFieldProps={{
                                            label          : 'Tags',
                                            InputLabelProps: {
                                                shrink: true
                                            },
                                            variant        : 'outlined'
                                        }}
                                        options={basedata && basedata.eventType.map(item => ({
                                            value: item.name,
                                            label: item.name,
                                        }))}
                                        isMulti
                                    />

                                    <TextField
                                        className="mt-8 mb-16"
                                        label="Website URL"
                                        id="website_url"
                                        name="website_url"
                                        value={form.website_url}
                                        onChange={this.handleChange}
                                        variant="outlined"
                                        fullWidth
                                    />

                                    <div className="flex">
                                        <div className="flex w-full m-4">
                                            <Typography variant="subtitle1" color="inherit" className="min-w-80 pt-20">
                                                    Language
                                            </Typography>
                                            <Select
                                                className="mb-24"
                                                native
                                                value={form.language}
                                                onChange={this.handleChange}
                                                input={
                                                <OutlinedInput
                                                    name="language"
                                                    labelWidth={0}
                                                    id="language"
                                                />
                                                }
                                                fullWidth
                                            >
                                                <option value="English">English</option>
                                                <option value="French">French</option>
                                                <option value="German">German</option>
                                            </Select>
                                        </div>
                                        <div className="flex w-full m-8">
                                            <Typography variant="subtitle1" color="inherit" className="min-w-60 pt-20">
                                                    State
                                            </Typography>
                                            <Select
                                                className="mb-24"
                                                native
                                                value={form.event_state}
                                                onChange={this.handleChange}
                                                input={
                                                <OutlinedInput
                                                    name="event_state"
                                                    labelWidth={0}
                                                    id="event_state"
                                                />
                                                }
                                                fullWidth
                                            >
                                                {basedata && 
                                                    basedata.eventState.map((cursor) => (
                                                        <option value={cursor.name} key={cursor._id}>{cursor.name}</option>
                                                    ))
                                                }
                                            </Select>
                                        </div>
                                        <TextField
                                            className="mt-8 mb-16"
                                            label="Visitors"
                                            id="visitors"
                                            name="visitors"
                                            value={form.visitors}
                                            onChange={this.handleChange}
                                            type="number"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    </div>

                                </div>
                            )}
                            {tabValue === 1 && (
                                <div>

                                    <div className="flex">
                                        <div className="flex w-full m-4">
                                            <Typography variant="subtitle1" color="inherit" className="min-w-80 pt-20">
                                                    Gender
                                            </Typography>
                                            <Select
                                                className="mb-24"
                                                native
                                                value={form.gender}
                                                onChange={this.handleChange}
                                                input={
                                                <OutlinedInput
                                                    name="gender"
                                                    labelWidth={0}
                                                    id="gender"
                                                />
                                                }
                                                fullWidth
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="MF">Male&Female</option>
                                            </Select>
                                        </div>
                                        <div className="flex w-full m-4">
                                            <Typography variant="subtitle1" color="inherit" className="min-w-80 pt-20">
                                                    Currency
                                            </Typography>
                                            <Select
                                                className="mb-24"
                                                native
                                                value={form.currency_type}
                                                onChange={this.handleChange}
                                                input={
                                                <OutlinedInput
                                                    name="currency_type"
                                                    labelWidth={0}
                                                    id="currency_type"
                                                />
                                                }
                                                fullWidth
                                            >
                                                {basedata && 
                                                    basedata.currency.map((cursor) => (
                                                        <option value={cursor.nickname} key={cursor._id}>{cursor.name}</option>
                                                    ))
                                                }
                                            </Select>
                                        </div>
                                    </div>

                                    <TextField
                                        className="mt-8 mb-16"
                                        label="Min Price"
                                        id="cost_min"
                                        name="cost_min"
                                        value={form.cost_min}
                                        onChange={this.handleChange}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">{form.currency_type}</InputAdornment>
                                        }}
                                        type="number"
                                        variant="outlined"
                                        fullWidth
                                    />

                                    <TextField
                                        className="mt-8 mb-16"
                                        label="Max Price"
                                        id="cost_max"
                                        name="cost_max"
                                        value={form.cost_max}
                                        onChange={this.handleChange}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">{form.currency_type}</InputAdornment>
                                        }}
                                        type="number"
                                        variant="outlined"
                                        fullWidth
                                    />

                                    <TextField
                                        className="mt-8 mb-16"
                                        label="Min Age"
                                        id="age_min"
                                        name="age_min"
                                        value={form.age_min}
                                        onChange={this.handleChange}
                                        type="number"
                                        variant="outlined"
                                        fullWidth
                                    />

                                    <TextField
                                        className="mt-8 mb-16"
                                        label="Max Age"
                                        id="age_max"
                                        name="age_max"
                                        value={form.age_max}
                                        onChange={this.handleChange}
                                        type="number"
                                        variant="outlined"
                                        fullWidth
                                        // helperText="Add a compare price to show next to the real price"
                                    />

                                    <TextField
                                        className="mt-8 mb-16"
                                        label="Start Time"
                                        id="datetime_from"
                                        name="datetime_from"
                                        value={form.datetime_from}
                                        onChange={this.handleChange}
                                        type=""
                                        variant="outlined"
                                        fullWidth
                                    />

                                    <TextField
                                        className="mt-8 mb-16"
                                        label="End Time"
                                        id="datetime_to"
                                        name="datetime_to"
                                        value={form.datetime_to}
                                        onChange={this.handleChange}
                                        type=""
                                        variant="outlined"
                                        fullWidth
                                    />

                                </div>
                            )}
                            {tabValue === 2 && (
                                <div>
                                    <Typography variant="h6" color="inherit">
                                            Joined Friends
                                    </Typography>
                                    <Paper className={classes.root}>
                                        <Table className={classes.table}>
                                            <TableHead>
                                            <TableRow>
                                                <CustomTableCell></CustomTableCell>
                                                <CustomTableCell>Friend Name</CustomTableCell>
                                                <CustomTableCell align="center">Email</CustomTableCell>
                                                <CustomTableCell align="left">Message</CustomTableCell>
                                                <CustomTableCell align="center">Cost</CustomTableCell>
                                                <CustomTableCell align="center">Action</CustomTableCell>
                                            </TableRow>
                                            </TableHead>
                                            <TableBody>
                                            {form.friend_join.map(row => (
                                                <TableRow className={classes.row} key={row._id}>
                                                <CustomTableCell component="th" scope="row">
                                                    <Avatar src={row.avatar} />
                                                </CustomTableCell>
                                                <CustomTableCell align="left">{row.name}</CustomTableCell>
                                                <CustomTableCell align="center">{row.email}</CustomTableCell>
                                                <CustomTableCell align="left">{row.message}</CustomTableCell>
                                                <CustomTableCell align="center">{row.cost} {form.currency_type}</CustomTableCell>
                                                <CustomTableCell align="center">
                                                    <IconButton onClick={(ev) => {
                                                        this.handleDeleteFriendJoin(row);
                                                    }}>
                                                        <Icon>delete</Icon>
                                                    </IconButton>
                                                </CustomTableCell>
                                                </TableRow>
                                            ))}
                                            {
                                                form.friend_join.length === 0 &&
                                                <Typography variant="subtitle1" color="inherit" className="min-w-80 pt-20">
                                                        No joined friends
                                                </Typography>
                                            }
                                            </TableBody>
                                        </Table>
                                    </Paper>
                                    <Typography variant="h6" color="inherit" className="mt-16">
                                            Offered Friends
                                    </Typography>
                                    <Paper className={classes.root}>
                                        <Table className={classes.table}>
                                            <TableHead>
                                            <TableRow>
                                                <CustomTableCell></CustomTableCell>
                                                <CustomTableCell>Friend Name</CustomTableCell>
                                                <CustomTableCell align="center">Email</CustomTableCell>
                                                <CustomTableCell align="left">Message</CustomTableCell>
                                                <CustomTableCell align="center">Cost</CustomTableCell>
                                                <CustomTableCell align="center">Action</CustomTableCell>
                                            </TableRow>
                                            </TableHead>
                                            <TableBody>
                                            {form.friend_offer.map(row => (
                                                <TableRow className={classes.row} key={row._id}>
                                                <CustomTableCell component="th" scope="row">
                                                    <Avatar src={row.avatar} />
                                                </CustomTableCell>
                                                <CustomTableCell align="left">{row.name}</CustomTableCell>
                                                <CustomTableCell align="center">{row.email}</CustomTableCell>
                                                <CustomTableCell align="left">{row.message}</CustomTableCell>
                                                <CustomTableCell align="center">{row.cost} {form.currency_type}</CustomTableCell>
                                                <CustomTableCell align="center">
                                                    <IconButton onClick={(ev) => {
                                                        this.handleDeleteFriendOffer(row);
                                                    }}>
                                                        <Icon>delete</Icon>
                                                    </IconButton>
                                                </CustomTableCell>
                                                </TableRow>
                                            ))}
                                            {
                                                form.friend_offer.length === 0 &&
                                                <Typography variant="subtitle1" color="inherit" className="min-w-80 pt-20">
                                                        No offered friends
                                                </Typography>
                                            }
                                            </TableBody>
                                        </Table>
                                    </Paper>
                                </div>
                            )}
                            {tabValue === 3 && (
                                <div className="w-full">
                                    <Typography className="h2 mb-16">Location</Typography>
                                    <div className="w-full h-512">
                                        <GoogleMap
                                            bootstrapURLKeys={{
                                                key: process.env.REACT_APP_MAP_KEY
                                            }}
                                            defaultZoom={12}
                                            defaultCenter={[form.lat, form.lng]}
                                        >
                                            <Marker
                                                text="Marker Text"
                                                lat={form.lat}
                                                lng={form.lng}
                                            />
                                        </GoogleMap>
                                    </div>
                                </div>
                            )}
                            {tabValue === 4 && (
                                <div className="w-full">
                                    <FeedbackTab user_id={form.employer_id} event_id={form._id}/>
                                </div>
                            )}
                        </div>
                    )
                }
                innerScroll
            />
        )
    };
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({
        getEvent : Actions.getEvent,
        newEvent : Actions.newEvent,
        saveEvent: Actions.saveEvent,
        addEvent : Actions.addEvent,
    }, dispatch);
}

function mapStateToProps({eCommerceApp})
{
    return {
        event: eCommerceApp.event
    }
}

export default withReducer('eCommerceApp', reducer)(withStyles(styles, {withTheme: true})(withRouter(connect(mapStateToProps, mapDispatchToProps)(Event))));
