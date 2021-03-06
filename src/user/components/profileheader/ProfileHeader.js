import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import SVG from 'react-inlinesvg'
import {
  Nav,
  NavItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'
import LogoutButtonContainer from '../logoutbutton/LogoutButtonContainer'
import ProfilePicture from '../profilepicture/ProfilePicture'
import { roundFloat3 } from '../../../utils/rounder'

import iconEther from '../../../icons/icon-ether.svg'

class ProfileHeader extends PureComponent {
  constructor(props) {
    super(props)
    this.userPayout = this.userPayout.bind(this)
    this.showIntroTour = this.showIntroTour.bind(this)
  }

  userPayout(event) {
    event.preventDefault()

    if (this.props.user.drops <= 0) {
      return alert('You have no earned amount for a payout.')
    }

    this.props.onUserPayout()
  }

  showIntroTour(event) {
    event.preventDefault()
    this.props.showIntroTour()
  }

  render() {
    return (
      <Nav navbar id="profile-header" className="d-inline-flex flex-row">
        <UncontrolledDropdown nav inNavbar>
          <DropdownToggle nav caret className="py-0" style={{ height: '50px' }}>
            <ProfilePicture
              diameter={50}
              address={this.props.user.address}
              url={this.props.user.imgUrl}
            />
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem disabled>@{this.props.user.name}</DropdownItem>
            <DropdownItem header>{this.props.user.bio}</DropdownItem>
            <DropdownItem divider />
            <DropdownItem>
              <Link to="/newsfeed" className="">
                Newsfeed
              </Link>
            </DropdownItem>
            <DropdownItem>
              <Link to="/profile" className="">
                Update profile
              </Link>
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem>
              <li className="nav-item">
                <a href="" className="" onClick={this.userPayout}>
                  Payout
                </a>
              </li>
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem>
              <li className="nav-item">
                <a href="" className="" onClick={this.showIntroTour}>
                  Show Intro Tour
                </a>
              </li>
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem>
              <LogoutButtonContainer />
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>

        <NavItem className="ml-2 d-flex align-items-center">
          <div id="profile-drop-number" className="nav-icon-nr font-white">
            {Number(roundFloat3(this.props.user.drops)).toFixed(3)}{' '}
            <SVG
              src={iconEther}
              wrapper={React.createFactory('div')}
              className="icon white d-inline"
            />
          </div>
        </NavItem>
      </Nav>
    )
  }
}

ProfileHeader.propTypes = {
  user: PropTypes.object,
  userPayout: PropTypes.func,
  showIntroTour: PropTypes.func,
}

export default ProfileHeader
