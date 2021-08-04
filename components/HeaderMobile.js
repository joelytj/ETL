import React, { Component } from 'react';
import { Menu, Segment, Container, Icon, Header, Grid, Input, Button, Sticky, Rail, Sidebar } from 'semantic-ui-react';
import { Link, Router } from '../routes';

class HeaderMobile extends Component {


    state = {};

    render() {
        const { 
            handleSidebarHide, 
            handleToggle,
            sidebarOpened,
            children
        } = this.props;

        return(
            <React.Fragment>
                <Sidebar.Pushable>
                    <Sidebar
                        as={Menu}
                        animation='push'
                        inverted
                        onHide={handleSidebarHide}
                        vertical
                        visible={sidebarOpened}
                        width='thin'
                        icon='labeled'
                        style={{backgroundColor: '#1F5846'}}
                    >
                        <Menu.Item header>
                            <h3>Home</h3>
                        </Menu.Item>

                        <Link route="/">
                            <a className = "item">
                                <Icon name='home'/>
                                Home
                            </a>
                        </Link>

                        <Link route="/questions/post">
                            <a className = "item">
                                <Icon name='post'/>
                                Post a question
                            </a>
                        </Link>

                        <Link route="/profile/user">
                            <a className = "item">
                                <Icon name='user'/>
                                Profile
                            </a>
                        </Link>

                    </Sidebar>

                    <Sidebar.Pusher dimmed={sidebarOpened} style={{minHeight: '100vh'}}>
                        <Rail
                            internal
                            position="left"
                            attached
                            style={{ top: "auto", height: "auto", width: "100%" }}
                        >
                            <Sticky context={this.props.contextRef}>
                                <Segment inverted vertical style={{ backgroundColor: '#1F5846', minHeight: 50 , padding: '1em 0em 0em 0em', textAlign: 'flex-end'}}>
                                    <Menu inverted style={{backgroundColor: '#1F5846'}}fixed='top' size='large' secondary>
                                        <Container>
                                            <Menu.Item onClick={handleToggle}>
                                                <Icon name='sidebar' />
                                            </Menu.Item>

                                            <Menu.Item header style={{padding: 0}}>
                                                <Icon name='ethereum' style={{float: 'left'}}/>
                                                Home
                                            </Menu.Item>

                                            <Menu.Item position='right'>
                                                <Button as='a' inverted onClick={() => Router.pushRoute(`/questions/post`)}>
                                                    Post a question
                                                </Button>
                                            </Menu.Item>
                                        </Container>
                                    </Menu>
                                    <Container style={{marginTop: '40px'}}>
                                        <Grid inverted style={{padding: '0em 0.7em 0em 1.5em'}} verticalAlign='bottom'>
                                            <Grid.Row>
                                                <Menu secondary inverted fluid>
                                                    <Menu.Item>
                                                    <Input icon={<Icon name='search' inverted circular link  onClick={() =>
                                                {
                                                    //console.log('value ',this.state.value);
                                                    if (this.state.value!='') Router.pushRoute(`/${'search+'+encodeURIComponent(this.state.value)}`);
                                                    if (this.state.value=="") Router.pushRoute(`/`);
                                                    }}/>}
                                                    />
                                                    </Menu.Item>

                                                    {/* <Menu.Item position='right' fitted>
                                                        <Button color='grey' size='mini' onClick={() => Router.pushRoute(`/disputes`)}>
                                                            <Icon name='warning circle'/>Disputes
                                                        </Button>
                                                    </Menu.Item> */}
                                                </Menu>
                                            </Grid.Row>
                                        </Grid>
                                    </Container>
                                </Segment>
                            </Sticky>
                        </Rail>
                        {children}
                    </Sidebar.Pusher>
                </Sidebar.Pushable>
            </React.Fragment>
        );
    }
}

export default HeaderMobile;

