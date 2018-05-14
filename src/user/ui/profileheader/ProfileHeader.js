import React, { Component } from 'react'
import { Link } from 'react-router'
import {
  Nav,
  NavItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'
import LogoutButtonContainer from '../logoutbutton/LogoutButtonContainer'

// Images
import iconAlarm from '../../../../public/icons/icon-alarm.svg'
import iconMessage from '../../../../public/icons/icon-message.svg'
import inkdropWhite from '../../../../public/icons/icon-inkdrop-white.svg'

class ProfileHeader extends Component {
  render() {
    return (
      <Nav navbar>
        <UncontrolledDropdown nav inNavbar>
          <DropdownToggle nav caret className="py-0">
            <img
              id="profile-picture"
              className="mr-1 profile-img"
              src={this.props.imgUrl}
              alt="profile"
            />
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem disabled>{this.props.name}</DropdownItem>
            <DropdownItem header>{this.props.bio}</DropdownItem>
            <DropdownItem>
              <Link to="/profile" className="">
                Update profile
              </Link>
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem>
              <LogoutButtonContainer />
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
        <NavItem className="mr-4">
          <img
            src={iconAlarm}
            className="align-middle nav-icons"
            width="20"
            height="20"
            alt="notifications"
          />
          <span id="profile-alarm-number" className=" nav-icon-nr font-white align-bottom ml-1" />
        </NavItem>
        <NavItem className="mr-4">
          <img
            src={iconMessage}
            className="align-middle nav-icons"
            width="20"
            height="20"
            alt="messages"
          />
          <span id="profile-message-number" className="nav-icon-nr font-white align-bottom ml-1" />
        </NavItem>
        <NavItem className="mr-4">
          <img
            src={inkdropWhite}
            className="align-middle nav-icons"
            width="20"
            height="20"
            alt="drops"
          />
          <span id="profile-drop-number" className="nav-icon-nr font-white align-bottom ml-1">
            {this.props.drops}
          </span>
        </NavItem>
      </Nav>
    )
  }
}

export default ProfileHeader