import { Contract } from '../../src/lib/index';

type PluginsKey = {
  /** The application containing plugin logic */
  application: AppID;
  /** The address that is allowed to initiate a rekey to the plugin */
  allowedCaller: Address;
};

type PluginInfo = {
  /** The last round at which this plugin can be called */
  lastValidRound: uint64;
  /** The number of rounds that must pass before the plugin can be called again */
  cooldown: uint64;
  /** The last round the plugin was called */
  lastCalled: uint64;
  /** Whether the plugin has permissions to change the admin account */
  adminPrivileges: boolean;
};

export class AbstractedAccount extends Contract {
  /** Target AVM 10 */
  programVersion = 10;

  /** The admin of the abstracted account. This address can add plugins and initiate rekeys */
  admin = GlobalStateKey<Address>({ key: 'a' });

  /** The address this app controls */
  controlledAddress = GlobalStateKey<Address>({ key: 'c' });

  /**
   * Plugins that add functionality to the controlledAddress and the account that has permission to use it.
   */
  plugins = BoxMap<PluginsKey, PluginInfo>({ prefix: 'p' });

  /**
   * Plugins that have been given a name for discoverability
   */
  namedPlugins = BoxMap<bytes, PluginsKey>({ prefix: 'n' });

  /**
   * Attempt to change the admin via plugin.
   *
   * @param plugin The app calling the plugin
   * @param allowedCaller The address that triggered the plugin
   * @param newAdmin The new admin
   *
   */
  arc58_pluginChangeAdmin(plugin: AppID, allowedCaller: Address, newAdmin: Address): void {
    verifyTxn(this.txn, { sender: plugin.address });
    assert(this.controlledAddress.value.authAddr === plugin.address, 'This plugin is not in control of the account');

    const key: PluginsKey = { application: plugin, allowedCaller: allowedCaller };
    assert(
      this.plugins(key).exists && this.plugins(key).value.adminPrivileges,
      'This plugin does not have admin privileges'
    );

    this.admin.value = newAdmin;
  }
}
