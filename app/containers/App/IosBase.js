import React, { Component, PropTypes } from 'react';
import {
  View,
  StatusBar,
} from 'react-native';
import DrawerLayout from 'react-native-drawer-layout';
import NavBar from 'react-native-navbar';
import Drawer from './Drawer';
import CustomNavButton from '../../components/CustomNavButton';
import menuIcon from '../../assets/ic_menu_black.png';

class IosBase extends Component {
  static propTypes = {
    title: PropTypes.string,
    statusBarBackgroundColor: PropTypes.string,
    toolbarBackgroundColor: PropTypes.string,
    children: PropTypes.node,
  };
  handleIconClick = () => {
    this.openDrawer();
  };
  handleDrawerItemClick = () => {
    this.closeDrawer();
  };
  drawerRef = (ref) => {
    if (ref) {
      this.openDrawer = ref.openDrawer;
      this.closeDrawer = ref.closeDrawer;
    }
  };
  render() {
    const {
      title,
      statusBarBackgroundColor,
      toolbarBackgroundColor,
      children,
    } = this.props;
    const renderDrawer = () => <Drawer onItemClick={this.handleDrawerItemClick} />;
    return (
      <DrawerLayout
        drawerBackgroundColor="#FFFFFF"
        drawerWidth={300}
        drawerPosition={DrawerLayout.positions.left}
        renderNavigationView={renderDrawer}
        ref={this.drawerRef}
      >
        <NavBar
          title={{ title }}
          style={{ alignItems: 'center', height: 44, backgroundColor: toolbarBackgroundColor }}
          statusBar={{
            style: 'light-content',
            tintColor: statusBarBackgroundColor,
          }}
          leftButton={
            <CustomNavButton
              icon={menuIcon}
              style={{ marginLeft: 16 }}
              onPress={this.handleIconClick}
            />
          }       
        />
        {children}
      </DrawerLayout>
    );
  }
}

export default IosBase;
