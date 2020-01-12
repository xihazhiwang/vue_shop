<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区-->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand" label="#">
          <template slot-scope="scope">
            <el-row :gutter="10"
                    v-for="(item1, i1) in scope.row.children"
                    :key="item1.id"
                    :class="['bdbottom', i1  === 0 ? 'bdtop' :'', 'vcenter']">
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"/>
              </el-col>
              <el-col :span="19">
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id + i2"
                        :class="[i2 === 0 ?  '' : 'bdtop', 'vcenter']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"/>
                  </el-col>
                  <el-col :span="18">
                    <el-tag closable
                            @close="removeRightById(scope.row, item3.id)"
                            v-for="(item3, i3) in item2.children" :key="item3.id + i3" type="warning">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini"
                       @click="showSetRightDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--分配权限-->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible" width="50%">
      <el-tree :data="rightsList" :props="defaultProps"
               show-checkbox node-key="id"
               default-expand-all
               ref="treeRef"
               :default-checked-keys="defKeys"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Roles',
    data () {
      return {
        rolesList: [],
        setRightDialogVisible: false,
        rightsList: [],
        defaultProps: {
          children: 'children',
          label: 'authName'
        },
        // 默认选中的节点
        defKeys: [],
        roleId: '',
        // 选中的角色id值
        selectedRoleId: ''
      }
    },
    created () {
      this.getRolesList()
    },
    methods: {
      async getRolesList () {
        const { data: res } = await this.$http.get('/roles')
        if (res.meta.status !== 200) {
          return this.$message.error('权限获取失败')
        }
        this.rolesList = res.data
      },
      async removeRightById (role, rightId) {
        const confirmResult = await this.$confirm('是否要删除', '提示').catch(err => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('取消了删除')
        }
        const { data: res } = await this.$http.delete(`/roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        role.children = res.data
      },
      async showSetRightDialog (role) {
        this.roleId = role.id
        const { data: res } = await this.$http.get('/rights/tree')
        if (res.meta.status !== 200) {
          return this.$message.error('获取权限数据失败')
        }
        this.rightsList = res.data
        this.defKeys = []
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
      },
      // 递归获取
      getLeafKeys (node, arr) {
        if (!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item => this.getLeafKeys(item, arr))
      },
      async allotRights () {
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const { data: res } = await this.$http.post(`/roles/${this.roleId}/rights`, { rids: keys.join(',') })
        if (res.meta.status !== 200) {
          return this.$message.error('分配权限失败')
        }
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.setRightDialogVisible = false
      }
    }
  }
</script>

<style scoped>
  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eeeeee;
  }

  .bdbottom {
    border-bottom: 1px solid #eeeeee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
